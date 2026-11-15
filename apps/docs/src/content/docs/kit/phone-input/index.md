---
title: Phone input
description: A phone number formatted as it is typed, with a searchable country picker, bound as the E.164 a server stores.
group: Kit
---

<script lang="ts">
	import Preview from '#lib/features/docs/components/Preview.svelte';
	import basicDemo from './demos/basic.svelte?demo';
	import formDemo from './demos/form.svelte?demo';
</script>

A phone field looks like a text input with a country dropdown beside it. Written that way, it stores
whatever was typed: `(415) 555-0123` from one user, `415.555.0123` from the next, and no country
code from either, so the SMS provider rejects both. Formatting it as it is typed is where hand-rolled
versions get stuck: the caret jumps to the end after every digit, and backspace hits a space the
formatter immediately puts back.

<Preview demo={basicDemo} />

## When to use

**Use it when**

- The value is a phone number something will dial or text: two-factor codes, on-call alerts, a
  team member's contact number.
- The server wants E.164 (`+14155550123`), whatever the reader typed.
- Readers come from more than one country.

**Reach for something else when**

- Only the country is wanted: [Country select](/docs/kit/country-select).
- The field is a short numeric code, such as a one-time passcode: shadcn's `InputOTP`.

## Usage

```svelte
<script lang="ts">
	import PhoneInput from '#lib/components/coral/kit/phone-input/phone-input.svelte';
	import type { CountryCode } from 'libphonenumber-js';

	let phone = $state<string>();
	let country = $state<CountryCode>('US');
</script>

<PhoneInput bind:value={phone} bind:country name="phone" aria-label="Phone number" />
```

Installing it adds `libphonenumber-js` to the project, and `kit/country-select` and `kit/combobox`
alongside it.

## Examples

### Typing and pasting

- **E.164 in, E.164 out.** `value` is `+14155550123` whatever the reader typed, which is what a
  database, Twilio or Stripe expects. The formatted text is only ever on screen.
- **Formatted as it is typed**, in the country's own national format, by
  [libphonenumber-js](https://gitlab.com/catamphetamine/libphonenumber-js). The caret stays after
  the digit just typed, even in the middle of the number.
- **Backspace deletes a digit.** Deleting a bracket, a space or a dash the formatter wrote removes
  the digit beside it instead of doing nothing.
- **The country follows the number.** A number typed, pasted or autofilled with a `+` in front
  sets the picker to its country. Picking a country second keeps the digits already typed.
- **The country search knows calling codes.** `+44` or `44` finds the United Kingdom, alongside the
  names and codes [`kit/country-select`](/docs/kit/country-select) already matches.

`onchange` never fires on mount, and never when `value` is assigned from code. A value assigned from
code, a saved record loading, is shown under its own country, nationally.

### In a form

<Preview demo={formDemo} />

With `name`, the form submits the E.164 value under it rather than the formatted text. The visible
field has no `name` of its own, so nothing submits twice.

A number too short or too long for its country holds the form's submit with `invalidMessage`; an
empty field is left to `required`. Validation uses libphonenumber-js's default metadata, which
checks a number's length for its country rather than every digit pattern. Check before saving with
the same library the component already brought in:

```ts
import { isValidPhoneNumber } from 'libphonenumber-js';

if (phone && isValidPhoneNumber(phone)) await save(phone);
```

### Without a country

Leave `country` out and the field is international: the first digit typed gets a `+` in front, and
the picker follows the calling code. That suits a product with no sensible default. Coral never
guesses one from the locale, which says what language the reader reads, not where their phone is.

### Disabled and readonly

Either one blocks the country button along with the number field.

## Props

Everything the shadcn input accepts stays available on the number field: `id`, `placeholder`,
`required`, `disabled`, `readonly`, `autocomplete` (`tel` by default), `aria-*`. On top of that:

| Prop                | Type                                   | Default                           | Description                                                         |
| ------------------- | -------------------------------------- | --------------------------------- | ------------------------------------------------------------------- |
| `value`             | `string`                               | -                                 | Bindable. The number in E.164, complete or not.                     |
| `country`           | `CountryCode`                          | -                                 | Bindable. ISO 3166-1 alpha-2. Left out, the field is international. |
| `countries`         | `CountryCode[]`                        | every country with a calling code | Which countries the picker lists.                                   |
| `locale`            | `string`                               | `en-US`                           | The language country names are written and sorted in.               |
| `onchange`          | `(value: string \| undefined) => void` | -                                 | The reader typed, pasted or picked a country.                       |
| `name`              | `string`                               | -                                 | Submits the E.164 value with a surrounding form.                    |
| `form`              | `string`                               | -                                 | `id` of the form, for a field outside it.                           |
| `invalidMessage`    | `string`                               | `Enter a complete phone number.`  | What the form says about a number of the wrong length.              |
| `countryLabel`      | `string`                               | `Country`                         | Name of the country button while no country is picked.              |
| `searchPlaceholder` | `string`                               | `kit/country-select`'s            | Placeholder for the country search.                                 |
| `emptyMessage`      | `string`                               | `kit/country-select`'s            | Shown when the country search matches nothing.                      |
| `class`             | `string`                               | -                                 | Merged onto the number field.                                       |
| `groupClass`        | `string`                               | -                                 | Merged onto the bordered group.                                     |

## Keyboard

The country button and the number field are two tab stops. The country list is a
[`kit/combobox`](/docs/kit/combobox), so it takes the rest of that component's keys too.

| Key               | Action                                                                             |
| ----------------- | ---------------------------------------------------------------------------------- |
| `Enter` / `Space` | On the country button: opens the country list, with focus in its search box.       |
| `↓` / `↑`         | In the list: highlights the next or previous country.                              |
| `Enter`           | In the list: picks the highlighted country, then moves focus on to the number.     |
| `Escape`          | In the list: closes it without picking.                                            |
| `Backspace`       | In the number: deletes the digit before the caret, past any formatting in between. |
| `Delete`          | In the number: deletes the digit after the caret, past any formatting in between.  |

## Accessibility

The country button is named by the country and its calling code, "Kenya +254", with the flag hidden,
and its list is a [`kit/combobox`](/docs/kit/combobox) with the same keyboard. Picking a country
moves focus on to the number. The number field is `type="tel"`, which brings up the dial pad on a
phone, and takes its label through `id` and `<Label for>` like any input. With no country picked,
the button is a globe named by `countryLabel`.

An incomplete number is reported through the field's own validity, so the browser shows
`invalidMessage` the way it shows any constraint it enforces.

## Customizing

`class` lands on the number field and `groupClass` on the bordered group around the country button
and the field. The group is shadcn's `input-group`, so the focus ring and the disabled and invalid
states are the theme's. The country list lines up with the whole group rather than the button.

`countryLabel`, `invalidMessage`, `searchPlaceholder` and `emptyMessage` can be stated once under
`'kit/phone-input'` in [`setCoralDefaults`](/docs/conventions#project-wide-defaults), and the
shared `locale` there sets the language of the country names. A prop at the call site still wins.

### The pieces

The picker is [`kit/country-select`](/docs/kit/country-select), handed a `trigger`, an `option` and
a `filter` of its own; the formatting is libphonenumber-js. The parsing, the country switch and the
calling-code match live in `phone.ts` beside the component, and the caret arithmetic in `caret.ts`,
so a project building a different layout can reuse both. Dropping to a raw shadcn `input-group`
means writing back the caret handling, the digit deletion, the country that follows the number and
the E.164 field that submits.
