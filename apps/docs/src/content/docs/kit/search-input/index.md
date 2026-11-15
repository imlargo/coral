---
title: Search input
description: A search field that debounces, deduplicates, clears with Escape, and leaves dialogs open.
group: Kit
category: Inputs
---

<script lang="ts">
	import Preview from '#lib/features/docs/components/Preview.svelte';
	import basicDemo from './demos/basic.svelte?demo';
	import remoteDemo from './demos/remote.svelte?demo';
</script>

A search box is an input with an icon until it drives a request. Then it needs a debounce, a way to
clear it that also clears the results, a rule for terms too short to be worth sending, and a guard
against sending the same term twice, and Escape inside a dialog has to clear the term instead of
closing the dialog.

<Preview demo={basicDemo} />

## When to use

**Use it when**

- A field filters a list or a table on the page: repositories, deployments, team members.
- The term drives a request, and each keystroke should not become one.
- The field sits inside a dialog or a sheet, where Escape must clear before it closes anything.

**Reach for something else when**

- The search picks one value out of a list: [Combobox](/docs/kit/combobox).
- It runs commands or jumps between pages: [Command palette](/docs/kit/command-palette).
- The search needs no request and no clear control: a plain shadcn `Input` with `type="search"`.

## Usage

```svelte
<script lang="ts">
	import SearchInput from '#lib/components/coral/kit/search-input/search-input.svelte';

	const repositories = ['api-gateway', 'billing-service', 'web-dashboard'];

	let term = $state('');
	const shown = $derived(repositories.filter((name) => name.includes(term.toLowerCase())));
</script>

<SearchInput onsearch={(next) => (term = next)} aria-label="Search repositories" />

{#each shown as name (name)}
	<p>{name}</p>
{/each}
```

## Examples

### What it reports

- **`onsearch` reports terms, not keystrokes.** Trimmed, debounced, and only when the term actually
  changed: typing a trailing space, or a letter and its backspace, sends nothing.
- **Enter searches now.** An explicit Enter skips the debounce.
- **Escape clears first.** The first press empties the field and stops there; the second is left to
  whatever is around it, so a search inside a dialog does not close the dialog on the way.
- **Clearing is a search.** The clear button and Escape report `''` straight away, so results
  filtered by the old term go too.
- **IME-safe.** Nothing is reported mid-composition, when a Japanese or Korean input method is still
  assembling a word.

### Remote search

<Preview demo={remoteDemo} />

`minLength` reads a short term as an empty search rather than no search: backspacing from `bog` to
`bo` clears the results instead of leaving them filtered by a term that is no longer on screen.
`loading` swaps the icon for a spinner and sets `aria-busy`.

A `value` set from code (restoring `?q=` from the URL, a "reset filters" button) is adopted as
already searched, so it is not reported back as if the reader typed it. A search still waiting on
the debounce for the old text is dropped rather than sent after it.

### Disabled and readonly

Both hide the clear button, and Escape no longer clears the field.

## Props

Everything the shadcn input accepts stays available: `placeholder`, `disabled`, `readonly`, `name`,
`id`, `aria-*`. On top of that:

| Prop             | Type                     | Default        | Description                                         |
| ---------------- | ------------------------ | -------------- | --------------------------------------------------- |
| `value`          | `string`                 | `''`           | Bindable. The raw field, untrimmed and undebounced. |
| `onsearch`       | `(term: string) => void` | -              | The term to search for.                             |
| `searchDebounce` | `number`                 | `300`          | Milliseconds of quiet before reporting.             |
| `minLength`      | `number`                 | `0`            | Shorter terms are reported as `''`.                 |
| `loading`        | `boolean`                | `false`        | Spinner in place of the icon.                       |
| `clearLabel`     | `string`                 | `Clear search` | Accessible label for the clear button.              |
| `class`          | `string`                 | -              | Merged onto the input.                              |
| `groupClass`     | `string`                 | -              | Merged onto the bordered group.                     |

## Keyboard

With focus in the field:

| Key      | Action                                                              |
| -------- | ------------------------------------------------------------------- |
| `Enter`  | Reports the term now, without waiting out the debounce.             |
| `Escape` | With text in the field: empties it, reports `''` and stops there.   |
| `Escape` | In an empty field: left to whatever is around it, such as a dialog. |

Neither key acts while an input method is composing. The clear button is a real button, reached
with `Tab`, and returns focus to the field.

## Accessibility

`type="search"` with `enterkeyhint="search"`: a search box to assistive tech, and a search key on a
mobile keyboard. The browser's own cancel button is hidden (it reports nothing but a bare `input`
event) and replaced by a labelled button. Name the field with `aria-label` or a `<label>`; a
placeholder is not a name. While `loading`, the field carries `aria-busy`.

## Customizing

`class` lands on the input and `groupClass` on the bordered group around the icon, the field and
the clear button. The group is shadcn's `input-group`, so the focus ring and the disabled and
invalid states are the theme's.

`clearLabel` and `searchDebounce` can be stated once under `'kit/search-input'` in
[`setCoralDefaults`](/docs/conventions#project-wide-defaults); a prop at the call site still wins.

A caller's `onkeydown` runs first, so calling `preventDefault` on it takes `Enter` or `Escape` away
from the component.

### The pieces

The debounce lives in `lib/debounce.ts`, shared with the combobox's server-side search. The rules
for what counts as a new term (`effectiveTerm`, `hasChanged`) are in `term.ts` beside the
component. Dropping to a raw shadcn `input-group` means writing back the debounce, the duplicate
guard, the two-step Escape, the clear that reports, and the adoption of a value set from code.
