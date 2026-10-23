---
title: Responsive dialog
description: A dialog on wide screens and a drawer on narrow ones, written once.
---

<script lang="ts">
	import Preview from '$docs/preview.svelte';
</script>

shadcn's own docs show how to do this, and the way it is done is by writing the dialog twice (once
inside `Dialog`, once inside `Drawer`) behind an `{#if isDesktop}`. Every change to the content is
then a change in two places, and crossing the breakpoint with it open closes it.

<Preview name="kit/responsive-dialog/basic" />

## What Coral adds

- **Written once.** Each piece reads which primitive the root chose from context and renders that
  primitive's own part, so the content is composed a single time.
- **Survives the breakpoint.** Both primitives bind the same `open`. Rotating a tablet or resizing a
  window with it open swaps the surface and keeps it open; state the caller owns (what was typed)
  stays too.
- **Each surface keeps its behaviour.** The dialog traps focus and closes on Escape; the drawer drags
  to dismiss. Nothing is emulated: they are shadcn's `dialog` and `drawer`.

## Composition

```text
ResponsiveDialog
├── ResponsiveDialogTrigger
└── ResponsiveDialogContent
    ├── ResponsiveDialogHeader
    │   ├── ResponsiveDialogTitle
    │   └── ResponsiveDialogDescription
    └── ResponsiveDialogFooter
        └── ResponsiveDialogClose
```

One file per piece, imported by path. Trigger and Close accept a `child` snippet exactly as the
primitives do, since under both primitives they are the same bits-ui parts.

## Spacing

The dialog pads its content; the drawer pads its header and footer and leaves the body to you. That is
the primitives' own layout and Coral does not paper over it: give the body `px-4 md:px-0`, as the
demo does, or whatever matches your `query`.

## Import

```svelte
<script lang="ts">
	import ResponsiveDialog from '$lib/components/coral/kit/responsive-dialog/responsive-dialog.svelte';
	import ResponsiveDialogContent from '$lib/components/coral/kit/responsive-dialog/responsive-dialog-content.svelte';
	// ...one import per piece you use
</script>
```

## Props

`ResponsiveDialog` accepts what the dialog root accepts: `open`, `onOpenChange`. On top of that:

| Prop       | Type      | Default              | Description                                          |
| ---------- | --------- | -------------------- | ---------------------------------------------------- |
| `open`     | `boolean` | `false`              | Bindable. Shared by both primitives.                 |
| `query`    | `string`  | `(min-width: 768px)` | Matches: dialog. Otherwise: drawer. Read once.       |
| `fallback` | `boolean` | `false`              | Whether the query is assumed to match on the server. |

`ResponsiveDialogContent` accepts the dialog content's props; `showCloseButton` applies to the dialog
only. The trigger, title, description and close forward everything to their primitive.

## Accessibility

Both surfaces are `role="dialog"` with `aria-modal`, labelled by the title and described by the
description, so always render a `ResponsiveDialogTitle`, even visually hidden with `sr-only`.
