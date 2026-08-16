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

| Prop                | Type          | Default               | Description                             |
| ------------------- | ------------- | --------------------- | --------------------------------------- |
| `options`           | `Option<T>[]` | -                     | The list to choose from.                |
| `value`             | `T`           | -                     | Selected value. Bindable.               |
| `open`              | `boolean`     | `false`               | Popover state. Bindable.                |
| `placeholder`       | `string`      | `Select an option...` | Trigger text while nothing is selected. |
| `searchPlaceholder` | `string`      | `Search...`           | Placeholder for the search box.         |
| `emptyMessage`      | `string`      | `No results found.`   | Shown when the search matches nothing.  |
| `disabled`          | `boolean`     | `false`               | Blocks the trigger.                     |
| `class`             | `string`      | -                     | Merged onto the trigger button.         |

The defaults are English because Coral is written in English. Every consuming project passes its
own copy - these exist so the component renders during a spike, not as a translation layer.

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
