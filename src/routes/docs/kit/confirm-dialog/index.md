---
title: Confirm dialog
description: Are you sure? - with the request it guards, and what happens when that request fails.
---

<script lang="ts">
	import Preview from '$lib/docs/preview.svelte';
</script>

One project in the corpus writes this inline **ten times**, with `AlertDialog`, a `Spinner`, an
`isSaving` flag and a `try/catch` each time. Two others extracted a component - built on `Dialog`,
which is the wrong primitive: it closes when you click outside, so a destructive confirmation is one
stray click away from being dismissed, and neither of them can wait for a request.

<Preview name="kit/confirm-dialog/basic" />

## What Coral adds

- **The right primitive.** `alert-dialog`: outside clicks are ignored, focus is trapped, the role is
  `alertdialog` and the title and description are wired to it.
- **It waits.** Hand it an async `onconfirm` and the dialog stays put until the promise settles.
- **It survives failure.** A rejected promise leaves the dialog open, so the error has somewhere to
  be reported and the reader can try again.
- **One click, one write.** A second click while the first request is in flight does nothing.
- **Escape stops meaning "cancel"** while a request is on its way to the server.

## Waiting, and failing

<Preview name="kit/confirm-dialog/async" />

That demo fails the first time and succeeds after. Nothing closes on the failure: the buttons come
back, the reader reads the error, and pressing the button again retries.

The rule is one line - **return `false`, or throw, to keep it open**:

```svelte
<ConfirmDialog
	title="¿Desactivar {unit.name}?"
	description="Si está en uso por un insumo activo, no podrá desactivarse."
	variant="destructive"
	confirmLabel="Desactivar"
	onconfirm={async () => {
		try {
			await units.setStatus(unit.id, RecordStatus.INACTIVE);
			toast.success(`${unit.name} fue desactivada.`);
		} catch (err) {
			toast.error(normalizeError(err).message);
			return false; // stays open, so they can retry
		}
	}}
/>
```

Catching inside `onconfirm` is the shape to aim for - it is what the corpus already does, and it puts
the message where the reader is looking. Letting the error propagate instead also keeps the dialog
open, but it surfaces as an unhandled rejection rather than as something a person can read.

While the promise is pending both buttons are disabled, the confirm button carries a spinner, and
Escape is ignored. Letting Escape through would read as _cancelled_ for a delete already on its way
to the server.

## Opening it

Two ways, and the choice is usually made for you:

- **A `trigger` snippet** when the dialog belongs to a button that is right there. Spread `props`
  onto whatever you render.
- **`bind:open`** when the dialog belongs to a row menu, a table action, or anything that decides to
  ask _after_ something else was clicked. This is the common case in a list screen.

## Extra detail in the body

Anything between the description and the buttons - what exactly is about to change.

<Preview name="kit/confirm-dialog/details" />

## Acknowledge-only

`showCancel={false}` leaves a dialog that can only be agreed with. Escape still closes it, so it is
a nudge and not a trap.

<Preview name="kit/confirm-dialog/acknowledge" />

## Installation

```bash
pnpm dlx shadcn-svelte@latest add alert-dialog button spinner
```

```svelte
<script lang="ts">
	import ConfirmDialog from '$lib/coral/kit/confirm-dialog/confirm-dialog.svelte';
</script>
```

## Props

Everything the shadcn alert-dialog root accepts stays available - `open`, `onOpenChange`. On top of
that:

| Prop           | Type                   | Default     | Description                                                      |
| -------------- | ---------------------- | ----------- | ---------------------------------------------------------------- |
| `title`        | `string`               | -           | The question. Required.                                          |
| `description`  | `string`               | -           | What changes, and whether it can be undone.                      |
| `onconfirm`    | `() => unknown`        | -           | Runs on confirm. Return `false` or throw to keep it open.        |
| `oncancel`     | `() => void`           | -           | Runs on cancel button or Escape. Never on confirm.               |
| `confirmLabel` | `string`               | `Continue`  | Label for the button that goes ahead.                            |
| `cancelLabel`  | `string`               | `Cancel`    | Label for the button that backs out.                             |
| `showCancel`   | `boolean`              | `true`      | Set `false` for acknowledge-only.                                |
| `variant`      | `ButtonVariant`        | `'default'` | Confirm button variant. `destructive` for anything irreversible. |
| `pending`      | `boolean`              | -           | Drive the busy state yourself. Otherwise it tracks `onconfirm`.  |
| `open`         | `boolean`              | `false`     | Bindable.                                                        |
| `size`         | `'default'` \| `'sm'`  | `'default'` | Forwarded to the content.                                        |
| `class`        | `string`               | -           | Merged onto the content.                                         |
| `trigger`      | `Snippet<[{ props }]>` | -           | The element that opens it.                                       |
| `children`     | `Snippet`              | -           | Extra content between description and buttons.                   |

## Accessibility

`role="alertdialog"`, `aria-modal`, and `aria-labelledby` / `aria-describedby` pointing at the title
and description - all from the primitive, all verified. Focus is trapped: Tab cycles inside the
dialog and cannot reach the page behind it. Outside clicks are ignored by design, which is the
difference between `alert-dialog` and `dialog`.

The cancel button is rendered through the primitive's `child` snippet for one reason: passed
`disabled` directly, the primitive keeps the flag for its own close handler and never puts it on the
element, leaving a button that looks pressable and does nothing. Going through `child` puts the
attribute where a keyboard and a screen reader can both see it.

## Why flat props

There is a canonical case and twelve sites in the corpus use exactly it: a question, a consequence,
two buttons. What varies - the trigger, extra body detail - is a snippet, so the
[conventions](/docs/conventions) are satisfied without a prop for every variation.

The one thing deliberately not here is a promise-returning `confirm()` helper you could `await` in
an event handler. It reads well in a single call site and badly everywhere else: the dialog has to be
mounted, and the corpus keeps it mounted per row.
