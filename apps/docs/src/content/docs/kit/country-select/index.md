---
title: Country select
description: Every country, named and sorted in the reader's language, and found by its English name or its code.
group: Kit
---

<script lang="ts">
	import Preview from '#lib/features/docs/components/Preview.svelte';
</script>

A country field is usually a combobox over an array of English names pasted into the project, and
it shows. The list is English in a product that is not, sorted by English spelling, and a reader
who looks for their country by the name they use gets nothing back.

<Preview name="kit/country-select/basic" />

## What Coral adds

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

## In another language

<Preview name="kit/country-select/locale" />

The names follow `locale`, and so does their order. The copy around them (placeholder, search
placeholder, empty message) is props, or stated once for the project with
[`setCoralDefaults`](/docs/conventions#project-wide-defaults).

## Import

```svelte
<script lang="ts">
	import CountrySelect from '#lib/components/coral/kit/country-select/country-select.svelte';
</script>
```

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

| Snippet     | Receives               | Replaces                                         |
| ----------- | ---------------------- | ------------------------------------------------ |
| `selection` | `{ selected }`         | The flag and name on the trigger.                |
| `option`    | `{ option, selected }` | The flag and name in a row - an image flag, say. |

`kit/phone-input` composes this component as its country picker, through the `trigger`, `option`
and `filter` it forwards.

## Accessibility

It is a [`kit/combobox`](/docs/kit/combobox), with the same keyboard and the same announcements.
The flag is `aria-hidden`; the name is what a screen reader reads, in the reader's language.
