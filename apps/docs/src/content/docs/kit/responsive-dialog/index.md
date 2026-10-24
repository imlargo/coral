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

One file per piece, imported by path. Trigger and Close accept a `child` snippet exactly as the
primitives do, since under both primitives they are the same bits-ui parts.

## The body

The dialog pads its whole content. The drawer pads only its header and footer, and caps its own
height, so anything placed between them touches the screen edges, and a form taller than the cap
cannot scroll. `ResponsiveDialogBody` is that middle region: in the drawer it takes the header's
padding and scrolls between a header and footer that stay put; in the dialog it is a plain
wrapper. It reads which primitive is showing, so nothing in it has to repeat your `query` as a
breakpoint class.

<Preview name="kit/responsive-dialog/form" />

A form whose submit button sits in the footer points that button at it with `form`, since the
footer is outside the body.

## Import

```svelte
<script lang="ts">
	import ResponsiveDialog from '#lib/components/coral/kit/responsive-dialog/responsive-dialog.svelte';
	import ResponsiveDialogContent from '#lib/components/coral/kit/responsive-dialog/responsive-dialog-content.svelte';
	// ...one import per piece you use
</script>
```

There is no `index.js` to import as `* as ResponsiveDialog`, the way shadcn's own parts are. Coral
has no barrels: every file is imported by its path, so a project only carries what it uses.

## Props

`ResponsiveDialog` accepts what the dialog root accepts: `open`, `onOpenChange`. On top of that:

| Prop       | Type      | Default              | Description                                          |
| ---------- | --------- | -------------------- | ---------------------------------------------------- |
| `open`     | `boolean` | `false`              | Bindable. Shared by both primitives.                 |
| `query`    | `string`  | `(min-width: 768px)` | Matches: dialog. Otherwise: drawer. Read once.       |
| `fallback` | `boolean` | `false`              | Whether the query is assumed to match on the server. |
| `children` | `Snippet` | -                    | The trigger and the content.                         |

`ResponsiveDialogContent` accepts the dialog content's props; `showCloseButton` applies to the dialog
only. The header, body and footer take a `<div>`'s attributes, `class` merged. The trigger, title,
description and close forward everything to their primitive.

## Accessibility

Both surfaces are `role="dialog"` with `aria-modal`, labelled by the title and described by the
description, so always render a `ResponsiveDialogTitle`, even visually hidden with `sr-only`.
