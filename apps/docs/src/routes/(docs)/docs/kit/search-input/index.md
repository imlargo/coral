---
title: Search input
description: A search field that debounces, deduplicates, clears with Escape, and leaves dialogs open.
---

<script lang="ts">
	import Preview from '$docs/preview.svelte';
</script>

A search box is an input with an icon until it drives a request. Then it needs a debounce, a way to
clear it that also clears the results, a rule for terms too short to be worth sending, and a guard
against sending the same term twice, and Escape inside a dialog has to clear the term instead of
closing the dialog.

<Preview name="kit/search-input/basic" />

## What Coral adds

- **`onsearch` reports terms, not keystrokes.** Trimmed, debounced, and only when the term actually
  changed: typing a trailing space, or a letter and its backspace, sends nothing.
- **Enter searches now.** An explicit Enter skips the debounce.
- **Escape clears first.** The first press empties the field and stops there; the second is left to
  whatever is around it, so a search inside a dialog does not close the dialog on the way.
- **Clearing is a search.** The clear button and Escape report `''` straight away, so results
  filtered by the old term go too.
- **IME-safe.** Nothing is reported mid-composition, when a Japanese or Korean input method is still
  assembling a word.

## Remote search

<Preview name="kit/search-input/remote" />

`minLength` reads a short term as an empty search rather than no search: backspacing from `bog` to
`bo` clears the results instead of leaving them filtered by a term that is no longer on screen.
`loading` swaps the icon for a spinner and sets `aria-busy`.

A `value` set from code (restoring `?q=` from the URL, a "reset filters" button) is adopted as
already searched, so it is not reported back as if the reader typed it.

## Import

```svelte
<script lang="ts">
	import SearchInput from '$lib/components/coral/kit/search-input/search-input.svelte';
</script>
```

## Props

Everything the shadcn input accepts stays available: `placeholder`, `disabled`, `readonly`, `name`,
`id`, `aria-*`. On top of that:

| Prop         | Type                     | Default        | Description                                         |
| ------------ | ------------------------ | -------------- | --------------------------------------------------- |
| `value`      | `string`                 | `''`           | Bindable. The raw field, untrimmed and undebounced. |
| `onsearch`   | `(term: string) => void` | -              | The term to search for.                             |
| `debounce`   | `number`                 | `300`          | Milliseconds of quiet before reporting.             |
| `minLength`  | `number`                 | `0`            | Shorter terms are reported as `''`.                 |
| `loading`    | `boolean`                | `false`        | Spinner in place of the icon.                       |
| `clearLabel` | `string`                 | `Clear search` | Accessible label for the clear button.              |
| `class`      | `string`                 | -              | Merged onto the input.                              |
| `groupClass` | `string`                 | -              | Merged onto the bordered group.                     |

## Accessibility

`type="search"` with `enterkeyhint="search"`: a search box to assistive tech, and a search key on a
mobile keyboard. The browser's own cancel button is hidden (it reports nothing but a bare `input`
event) and replaced by a labelled button. Name the field with `aria-label` or a `<label>`; a
placeholder is not a name.

The debounce lives in `lib/debounce.ts`, shared with the combobox's server-side search.
