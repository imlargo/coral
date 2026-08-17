---
title: Combobox
description: A select with a search box, filtering the way Spanish is actually typed.
---

<script lang="ts">
	import Preview from '$lib/docs/preview.svelte';
</script>

shadcn builds the combobox out of a popover and a command menu, and its docs are explicit that this
is a recipe rather than a component: around fifty lines of markup, a `triggerRef`, and a
`closeAndFocusTrigger` that has to be written by hand every time.

Three Kora projects wrote it. Two are byte-identical copies of each other; the third diverged and
lost the accent handling on the way. That is the pattern this component ends.

<Preview name="kit/combobox/basic" />

## What Coral adds

Only two things, both behavior:

- **Accent-insensitive search.** Typing `bogota` finds `Bogotá`. Command's own matcher compares raw
  strings, so it finds nothing.
- **Focus returns to the trigger** after a selection, so the next Tab continues through the form
  instead of restarting at the top of the document.

Everything else is shadcn's, unchanged.

## Search

<Preview name="kit/combobox/accents" />

Both the search term and the label are folded before comparison: lower case, accents removed, `ñ`
to `n`. It matches how people type, not how the word is spelled.

This is the difference between the existing implementations. `butter` and `suntalk` fold; the third
project does not, so its city picker is empty for anyone who types `bogota`.

## Installation

```bash
pnpm dlx shadcn-svelte@latest add popover command button
```

```svelte
<script lang="ts">
	import Combobox from '$lib/coral/kit/combobox/combobox.svelte';
</script>
```

## Props

Everything the shadcn popover root accepts stays available - `open`, `onOpenChange`,
`onOpenChangeComplete`. On top of that:

| Prop                | Type                                | Default               | Description                                              |
| ------------------- | ----------------------------------- | --------------------- | -------------------------------------------------------- |
| `options`           | `Option<T>[]` \| `OptionGroup<T>[]` | -                     | The list to choose from, flat or grouped.                |
| `type`              | `'single'` \| `'multiple'`          | `'single'`            | Decides the shape of `value` and `onchange`.             |
| `value`             | `T` \| `T[]`                        | -                     | The selection. Bindable.                                 |
| `onchange`          | `(value, option) => void`           | -                     | Fired when the user picks, toggles or clears.            |
| `open`              | `boolean`                           | `false`               | Popover state. Bindable.                                 |
| `search`            | `string`                            | `''`                  | The search term. Bindable.                               |
| `onsearch`          | `(search: string) => void`          | -                     | Fired as the user types. For server-side search.         |
| `searchDebounce`    | `number`                            | `0`                   | Milliseconds to wait before `onsearch` fires.            |
| `shouldFilter`      | `boolean`                           | `true`                | Client-side filtering. `false` when the server filtered. |
| `filter`            | `(option, search) => boolean`       | folded match          | Replaces the built-in matching.                          |
| `clearable`         | `boolean`                           | `false`               | Adds a clear control; re-picking deselects.              |
| `loading`           | `boolean`                           | `false`               | Swaps the list for an indicator.                         |
| `disabled`          | `boolean`                           | `false`               | Blocks the trigger.                                      |
| `name`              | `string`                            | -                     | Submits with a surrounding form as hidden inputs.        |
| `maxDisplay`        | `number`                            | `3`                   | Badges before collapsing into a counter.                 |
| `placeholder`       | `string`                            | `Select an option...` | Trigger text while nothing is selected.                  |
| `searchPlaceholder` | `string`                            | `Search...`           | Placeholder for the search box.                          |
| `emptyMessage`      | `string`                            | `No results found.`   | Shown when the search matches nothing.                   |
| `clearLabel`        | `string`                            | `Clear selection`     | Accessible label for the clear control.                  |
| `class`             | `string`                            | -                     | Merged onto the trigger button.                          |
| `contentClass`      | `string`                            | -                     | Merged onto the popover content.                         |
| `listClass`         | `string`                            | -                     | Merged onto the scrolling list - e.g. its max height.    |

### Snippets

| Snippet     | Receives                                         | Replaces                              |
| ----------- | ------------------------------------------------ | ------------------------------------- |
| `trigger`   | `{ props, selected, open, disabled, clear }`     | The whole trigger.                    |
| `option`    | `{ option, selected }`                           | The body of a row.                    |
| `empty`     | -                                                | The empty state.                      |
| `indicator` | -                                                | The loading row.                      |
| `footer`    | `{ selected, visible, clear, selectAll, close }` | Nothing - it is added below the list. |

### Option

| Field         | Type       | Description                                     |
| ------------- | ---------- | ----------------------------------------------- |
| `value`       | `T`        | Matched with `===`.                             |
| `label`       | `string`   | Shown, and searched.                            |
| `description` | `string`   | Second line. Searched.                          |
| `keywords`    | `string[]` | Searched, never shown.                          |
| `disabled`    | `boolean`  | Blocks selection; stays visible and searchable. |

The defaults are English because Coral is written in English. Every consuming project passes its
own copy - these exist so the component renders during a spike, not as a translation layer.

## Reacting to a selection

`bind:value` keeps state in sync. `onchange` answers a different question: _the user just chose
something_. It receives the new value and the whole option, because the label is wanted often
enough that a caller would otherwise look it up again on the next line.

<Preview name="kit/combobox/onchange" />

It fires from the selection handler and nowhere else, so it never fires on mount and never fires
when `value` is assigned from code - as the button in that demo shows.

That distinction is the reason it exists rather than being left to the caller. Deriving the signal
from the value instead:

```svelte
<!-- Don't. Fires on mount, and on every programmatic assignment. -->
$effect(() => save(city));
```

is what two projects in the corpus do, and both ship the same bug: an `onchange('')` on mount,
before anyone has touched the control.

Use `bind:value` when you only need the state, `onchange` when something should _happen_. Both
together is fine.

## Multiple selection

`type="multiple"` switches `value` to an array. The trigger collapses into badges plus a counter
past `maxDisplay`, and the popover stays open while picking - choosing one of several is rarely
choosing the last one.

<Preview name="kit/combobox/multiple" />

The `footer` snippet gets `selectAll`, `clear`, the current selection and everything passing the
filter, which is enough to build bulk actions without Coral guessing what they should say.

> Badges in the trigger are not individually removable. A button nested inside a button is invalid
> HTML, and browsers recover by dropping one of the two - which is how a per-badge remove control
> ends up unreachable by keyboard. Deselect from the list, or use the clear control.

## Groups, descriptions and keywords

<Preview name="kit/combobox/groups" />

Pass groups instead of options and each gets a heading. `description` renders as a second line and
is searched. `keywords` are searched but never shown - synonyms, codes, an old name. Try `dc`,
`boyaca` or `atlantico` in that demo.

Filtering removes rows rather than hiding them, so a group whose options all fail the search
disappears along with its heading - no empty section left behind.

## Server-side search

`onsearch` fires as the user types, debounced by `searchDebounce`. Fetch, hand the results back
through `options`, and set `shouldFilter={false}` so a list the server already filtered is not
filtered twice.

<Preview name="kit/combobox/remote" />

`loading` swaps the list for an indicator. The search term is cleared when the popover closes, so
the next open starts from the full list rather than from whatever was typed last time.

## Custom trigger and options

<Preview name="kit/combobox/custom-trigger" />

The `trigger` snippet replaces the button entirely - spread `props` onto whatever you render and
the popover still wires itself up. The `option` snippet replaces the body of each row, and the
theme's check indicator stays.

Between those two, `footer`, `empty` and `indicator`, every visible part is replaceable without
dropping Coral and rebuilding from raw shadcn.

## Typed values

`Option<T>` is generic. The value stays whatever the project already has - an id, an enum member -
and comes back out the same type, with no conversion at the call site.

<Preview name="kit/combobox/typed-values" />

Options are matched with `===`, so object values compare by reference. `disabled` on an option is
forwarded to the command item.

> **Known gap, upstream.** A disabled option is genuinely inert - it carries `aria-disabled`, it
> cannot be selected by pointer or keyboard - but it currently looks identical to the others.
> shadcn's command item styles `data-[disabled=true]`, while bits-ui renders `data-disabled=""`, so
> the dimming never applies. Coral cannot fix it: `ui/` is shadcn-managed, and supplying the opacity
> here would be Coral defining appearance. Pass a `class` on the option's own content if the
> distinction matters before it is fixed upstream.

## Why flat props, for now

The [conventions](/docs/conventions) call for composition when the parts vary independently, and a
combobox eventually does - a custom trigger, grouped options, options loaded from a server. This
version is deliberately the canonical case only: one value, a static list, a search box.

Two decisions keep that from becoming a dead end:

- **The value type is generic from day one.** Widening a closed `string` later would break every
  project that had already worked around it.
- **The popover root's props are forwarded**, so `open` and `onOpenChange` are already the caller's.

What is not here yet - multi-select, remote options, a custom trigger, per-option rendering - is
deferred, not designed away. The [analysis](/docs/conventions) that produced this component found
remote options to be the first thing that breaks a static `options` array in a real list, so that
is the likely next extension.

## fold()

The search folding lives in `kit/combobox/fold.ts` and is exported on its own, so a project that
needs the same comparison elsewhere - a client-side table filter, a sort - does not re-implement it.

```ts
import { fold } from '$lib/coral/kit/combobox/fold.js';

fold('Bogotá'); // 'bogota'
fold('Muñoz'); // 'munoz'
fold('Medellín'); // 'medellin'
```

It stays inside the component's folder because it has exactly one consumer in Coral today. It moves
to `lib/` the day a second component needs it - which, on current evidence, is when the select
lands.
