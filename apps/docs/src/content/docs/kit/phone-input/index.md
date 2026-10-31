---
title: Phone input
description: A phone number formatted as it is typed, with a searchable country picker, bound as the E.164 a server stores.
group: Kit
---

<script lang="ts">
	import Preview from '#lib/features/docs/components/Preview.svelte';
</script>

A phone field looks like a text input with a country dropdown beside it. Written that way, it stores
whatever was typed: `(415) 555-0123` from one user, `415.555.0123` from the next, and no country
code from either, so the SMS provider rejects both. Formatting it as it is typed is where hand-rolled
versions get stuck: the caret jumps to the end after every digit, and backspace hits a space the
formatter immediately puts back.

<Preview name="kit/phone-input/basic" />

## What Coral adds

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
- **The form checks the length.** A number too short or too long for its country holds the form's
  submit with `invalidMessage`; an empty field is left to `required`.

## In a form

<Preview name="kit/phone-input/form" />

With `name`, the form submits the E.164 value under it rather than the formatted text. The visible
field has no `name` of its own, so nothing submits twice.

Validation uses libphonenumber-js's default metadata, which checks a number's length for its country
rather than every digit pattern. Check before saving with the same library the component already
brought in:

```ts
import { isValidPhoneNumber } from 'libphonenumber-js';

if (phone && isValidPhoneNumber(phone)) await save(phone);
```

## Without a country

Leave `country` out and the field is international: the first digit typed gets a `+` in front, and
the picker follows the calling code. That suits a product with no sensible default. Coral never
guesses one from the locale, which says what language the reader reads, not where their phone is.

## Import

```svelte
<script lang="ts">
	import PhoneInput from '#lib/components/coral/kit/phone-input/phone-input.svelte';
</script>
```

Installing it adds `libphonenumber-js` to the project, and `kit/country-select` and `kit/combobox`
alongside it.

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

`onchange` never fires on mount, and never when `value` is assigned from code. A value assigned from
code, a saved record loading, is shown under its own country, nationally.

## Accessibility

The country button is named by the country and its calling code, "Kenya +254", with the flag hidden,
and its list is a [`kit/combobox`](/docs/kit/combobox) with the same keyboard. Picking a country
moves focus on to the number. The number field is `type="tel"`, which brings up the dial pad on a
phone, and takes its label through `id` and `<Label for>` like any input.
