---
title: Responsive dialog
description: A dialog on wide screens and a drawer on narrow ones, written once.
group: Kit
---

<script lang="ts">
	import Preview from '#lib/features/docs/components/Preview.svelte';
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
- **One body for both.** `ResponsiveDialogBody` is padded like the drawer's own header and footer
  on a phone and left to the dialog's padding on a desktop, and it is the part that scrolls when a
  form is taller than the screen.

## Composition

```text
ResponsiveDialog
├── ResponsiveDialogTrigger
└── ResponsiveDialogContent
    ├── ResponsiveDialogHeader
    │   ├── ResponsiveDialogTitle
    │   └── ResponsiveDialogDescription
    ├── ResponsiveDialogBody
    └── ResponsiveDialogFooter
        └── ResponsiveDialogClose
```

One file per piece, imported by path. There is no `import * as ResponsiveDialog` namespace, because
Coral has no barrels: each piece is its own import, as the snippet under **Import** shows. Trigger
and Close accept a `child` snippet exactly as the primitives do, since under both primitives they
are the same bits-ui parts.

## The body

<Preview name="kit/responsive-dialog/form" />

The dialog pads everything inside it; the drawer pads its header and footer and leaves the body to
whoever wrote it, so the same form sits flush against the screen edges on a phone and looks right
on a desktop, and the difference only ever shows on the device the author did not test on. Put the
fields in `ResponsiveDialogBody` and both surfaces read the same: it carries the drawer's own inset
where the drawer needs it and nothing where the dialog already pads.

It is also the part that scrolls. Both surfaces are capped at the viewport, so a form taller than the
screen scrolls inside the body while the title and the buttons stay where the reader can see them.

## Import

```svelte
<script lang="ts">
	import ResponsiveDialog from '#lib/components/coral/kit/responsive-dialog/responsive-dialog.svelte';
	import ResponsiveDialogContent from '#lib/components/coral/kit/responsive-dialog/responsive-dialog-content.svelte';
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
| `children` | `Snippet` | -                    | The trigger and the content.                         |

`ResponsiveDialogContent` accepts the dialog content's props; `showCloseButton` applies to the dialog
only. The trigger, title, description and close forward everything to their primitive, and the
header, body and footer are each a `<div>` that takes `class` and `ref`.

## Accessibility

Both surfaces are `role="dialog"` with `aria-modal`, labelled by the title and described by the
description, so always render a `ResponsiveDialogTitle`, even visually hidden with `sr-only`.
