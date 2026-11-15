---
title: Responsive dialog
description: A dialog on wide screens and a drawer on narrow ones, written once.
group: Kit
---

<script lang="ts">
	import Preview from '#lib/features/docs/components/Preview.svelte';
	import basicDemo from './demos/basic.svelte?demo';
	import formDemo from './demos/form.svelte?demo';
</script>

shadcn's own docs show how to do this, and the way it is done is by writing the dialog twice (once
inside `Dialog`, once inside `Drawer`) behind an `{#if isDesktop}`. Every change to the content is
then a change in two places, and crossing the breakpoint with it open closes it.

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

<Preview demo={basicDemo} />

## When to use

**Use it when**

- The same short task opens from a phone and a desktop: inviting a team member, renaming a project,
  creating an API key.
- The content is a form that may be taller than a phone's screen.

**Reach for something else when**

- The question is a yes or no in front of a destructive request: use
  [Confirm dialog](/docs/kit/confirm-dialog), which waits for the request and ignores outside
  clicks.
- The app only runs on one kind of screen: shadcn's `Dialog` or `Drawer` alone is less to load.
- The content is a long page of its own, with its own URL: a route reads better than a modal.

## Usage

```svelte
<script lang="ts">
	import ResponsiveDialog from '#lib/components/coral/kit/responsive-dialog/responsive-dialog.svelte';
	import ResponsiveDialogContent from '#lib/components/coral/kit/responsive-dialog/responsive-dialog-content.svelte';
	// ...one import per piece you use
</script>
```

```svelte
<ResponsiveDialog bind:open>
	<ResponsiveDialogTrigger class={buttonVariants({ variant: 'outline' })}>
		Invite someone
	</ResponsiveDialogTrigger>
	<ResponsiveDialogContent>
		<ResponsiveDialogHeader>
			<ResponsiveDialogTitle>Invite to project</ResponsiveDialogTitle>
		</ResponsiveDialogHeader>
		<ResponsiveDialogBody>
			<Input type="email" bind:value={email} aria-label="Email" />
		</ResponsiveDialogBody>
		<ResponsiveDialogFooter>
			<Button onclick={() => (open = false)}>Send invitation</Button>
		</ResponsiveDialogFooter>
	</ResponsiveDialogContent>
</ResponsiveDialog>
```

## Examples

### Composition

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
Coral has no barrels: each piece is its own import, as the snippet under **Usage** shows. Trigger
and Close accept a `child` snippet exactly as the primitives do, since under both primitives they
are the same bits-ui parts.

A piece rendered outside `<ResponsiveDialog>` throws an error that says so, rather than guessing
which primitive to draw.

### The body

<Preview demo={formDemo} />

The dialog pads everything inside it; the drawer pads its header and footer and leaves the body to
whoever wrote it, so the same form sits flush against the screen edges on a phone and looks right
on a desktop, and the difference only ever shows on the device the author did not test on. Put the
fields in `ResponsiveDialogBody` and both surfaces read the same: it carries the drawer's own inset
where the drawer needs it and nothing where the dialog already pads.

It is also the part that scrolls. Both surfaces are capped at the viewport, so a form taller than the
screen scrolls inside the body while the title and the buttons stay where the reader can see them.

### Before the page can measure

On the server there is no viewport to match the query against, so `fallback` decides which surface
is rendered first; it is `false`, the drawer, unless you say otherwise. Once the page is in the
browser the query takes over.

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

## Keyboard

Both surfaces are the primitives' own, and so are their keys. Once open, focus stays inside.

| Key                     | Action                                                   |
| ----------------------- | -------------------------------------------------------- |
| `Enter` / `Space`       | On the trigger, opens it. On the close, closes it.       |
| `Tab` / `Shift` + `Tab` | Moves between the controls inside, without leaving them. |
| `Escape`                | Closes the dialog or the drawer.                         |

## Accessibility

- **Role and name.** Both surfaces are `role="dialog"` with `aria-modal`, labelled by the title and
  described by the description, so always render a `ResponsiveDialogTitle`, even visually hidden
  with `sr-only`.
- **Focus** is trapped inside either surface while it is open, by the primitive.
- **The swap keeps it open.** Crossing the breakpoint unmounts one primitive and mounts the other
  already open, so a reader who rotates a tablet is not dropped back on the page.

## Customizing

- **`class`** on each piece lands on the primitive part it renders (the dialog or drawer content,
  header or footer), and on the body's own `<div>`, where its drawer inset and scrolling merge with
  yours.
- **`query`** moves the breakpoint. It can be stated once with
  [`setCoralDefaults`](/docs/conventions#project-wide-defaults) under `'kit/responsive-dialog'`; a
  `query` on the root still wins.
- **`child`** on the trigger and the close renders your own element, as with the primitives.

### The pieces

Every piece is a file you can leave out or replace: a dialog without a description, a footer of your
own markup. The context in `context.ts` (`getResponsiveDialog()`) tells a piece of your own whether
the root chose the dialog, through its `desktop` flag, so it can render the matching primitive part
the way the shipped pieces do. Dropping down to shadcn's `Dialog` and `Drawer` means writing the
content twice again and losing the open state when the breakpoint is crossed.
