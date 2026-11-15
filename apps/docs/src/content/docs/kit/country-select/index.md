---
title: Country select
description: Every country, named and sorted in the reader's language, and found by its English name or its code.
group: Kit
---

<script lang="ts">
	import Preview from '#lib/features/docs/components/Preview.svelte';
	import basicDemo from './demos/basic.svelte?demo';
	import localeDemo from './demos/locale.svelte?demo';
</script>

A country field is usually a combobox over an array of English names pasted into the project, and
it shows. The list is English in a product that is not, sorted by English spelling, and a reader
who looks for their country by the name they use gets nothing back.

Coral ships only the codes and asks the platform for the names, in the reader's language and in
the reader's order, and still finds each country by its code and its English name.

<Preview demo={basicDemo} />

## When to use

**Use it when**

- The field holds a country: a billing address, a team member's location, a data residency region
  named by country.
- The product is read in more than one language and the names should follow it.
- The value should be the ISO 3166-1 alpha-2 code, not a translated name.

**Reach for something else when**

- The country is only there to prefix a phone number: [Phone input](/docs/kit/phone-input) picks it
  with the number.
- The list is a handful of regions that are not countries (`eu-west`, `us-east`):
  [Select](/docs/kit/select).
- The list is any other long, searchable set: [Combobox](/docs/kit/combobox).

## Usage

```svelte
<script lang="ts">
	import CountrySelect from '#lib/components/coral/kit/country-select/country-select.svelte';

	let country = $state<string>();
</script>

<CountrySelect bind:value={country} />
```

## Examples

### Names, order and search

- **Names from the platform.** The list ships as the 249 ISO 3166-1 codes only. Names come from
  `Intl.DisplayNames` in `locale`, so there is no translation table to ship or keep current.
- **Sorted the way the reader reads.** Through the locale's collator, so `Österreich` sorts among
  the O's in German, where a plain sort puts it after `Schweiz`.
- **Found by more than one name.** Each country also matches its code and its English name, so
  `germany` finds `Deutschland` and `ie` finds Ireland. Accents fold the way they do in
  [`kit/combobox`](/docs/kit/combobox).
- **A flag, without assets.** Drawn from regional indicator symbols and hidden from screen readers,
  which would otherwise read "flag: Kenya" before "Kenya". Platforms without flag glyphs, Windows
  among them, show the two letters instead.

### In another language

<Preview demo={localeDemo} />

The names follow `locale`, and so does their order. The copy around them (placeholder, search
placeholder, empty message) is props, or stated once for the project with
[`setCoralDefaults`](/docs/conventions#project-wide-defaults).

### A shorter list

`countries` takes the codes to list, for a product that only serves some of them. They are sorted
by name in `locale` whatever order they are passed in.

### Forms and states

It submits like the combobox it is: `name` writes the selected code, `required` blocks submission
while nothing is selected, and `disabled` blocks the trigger. A search that matches no country shows
`emptyMessage` inside the list and announces it.

## Props

Everything [`kit/combobox`](/docs/kit/combobox) takes is forwarded, with the value fixed to a
country code: `onchange`, `clearable`, `disabled`, `name`, `required`, `filter`, `anchor`, `id`,
`aria-*`, the `trigger` and `footer` snippets. On top of that, or with a different default:

| Prop                | Type       | Default               | Description                                             |
| ------------------- | ---------- | --------------------- | ------------------------------------------------------- |
| `value`             | `string`   | -                     | Bindable. The ISO 3166-1 alpha-2 code, upper case.      |
| `countries`         | `string[]` | every country         | Which codes to list. Sorted by name whatever the order. |
| `locale`            | `string`   | `en-US`               | The language the names are written and sorted in.       |
| `open`              | `boolean`  | `false`               | Bindable. Popover state.                                |
| `search`            | `string`   | `''`                  | Bindable. The search term.                              |
| `placeholder`       | `string`   | `Select a country...` | Trigger text while nothing is selected.                 |
| `searchPlaceholder` | `string`   | `Search countries...` | Placeholder for the search box.                         |
| `emptyMessage`      | `string`   | `No country found.`   | Shown, and announced, when the search matches nothing.  |
| `clearLabel`        | `string`   | `Clear country`       | Accessible label for the clear control.                 |

### Snippets

| Snippet     | Receives               | Replaces                                         |
| ----------- | ---------------------- | ------------------------------------------------ |
| `selection` | `{ selected }`         | The flag and name on the trigger.                |
| `option`    | `{ option, selected }` | The flag and name in a row - an image flag, say. |

## Keyboard

The keys are [`kit/combobox`](/docs/kit/combobox)'s: the trigger is a button, and once the list is
open focus stays in the search box while the arrow keys move the highlight.

| Key                | Action                                                                             |
| ------------------ | ---------------------------------------------------------------------------------- |
| `Enter` / `Space`  | On the trigger: opens the list, with focus in the search box.                      |
| `↓` / `↑`          | Highlights the next or previous country.                                           |
| `Home` / `End`     | Highlights the first or last country.                                              |
| `Ctrl` + `N` / `J` | Same as `↓`.                                                                       |
| `Ctrl` + `P` / `K` | Same as `↑`.                                                                       |
| `Enter`            | In the search box: picks the highlighted country and returns focus to the trigger. |
| `Escape`           | Closes the list and forgets the search term.                                       |

## Accessibility

It is a [`kit/combobox`](/docs/kit/combobox), with the same keyboard and the same announcements.
The flag is `aria-hidden`; the name is what a screen reader reads, in the reader's language.

## Customizing

Everything the combobox lets you change is forwarded: `class` lands on the trigger, `contentClass`
on the popover and `listClass` on the scrolling list.

### Snippets

`selection` and `option` replace the flag and name, on the trigger and in each row; an image flag
is the usual reason. `trigger` and `footer` pass through to the combobox unchanged.

### Project-wide defaults

`placeholder`, `searchPlaceholder`, `emptyMessage` and `clearLabel` can be stated once under
`'kit/country-select'` in [`setCoralDefaults`](/docs/conventions#project-wide-defaults), and the
shared `locale` there sets the language of the names. A prop at the call site still wins.

### The pieces

The component is [`kit/combobox`](/docs/kit/combobox) with an option list built for it.
`countries.ts` beside it exports `COUNTRIES` (every code), `flag(code)` and
`countryOptions(codes, locale)`, which returns the named, sorted options with the code and the
English name as keywords. Hand those options to a combobox of your own and you keep the names, the
order and the search; only the flags in the trigger and rows are left to draw.

`kit/phone-input` composes this component as its country picker, through the `trigger`, `option`
and `filter` it forwards.
