---
title: Confirm dialog
description: Are you sure? - with the request it guards, and what happens when that request fails.
group: Kit
---

<script lang="ts">
	import Preview from '#lib/features/docs/components/Preview.svelte';
	import basicDemo from './demos/basic.svelte?demo';
	import asyncDemo from './demos/async.svelte?demo';
	import detailsDemo from './demos/details.svelte?demo';
	import typeToConfirmDemo from './demos/type-to-confirm.svelte?demo';
	import acknowledgeDemo from './demos/acknowledge.svelte?demo';
</script>

Written by hand, this is an `AlertDialog`, a `Spinner`, an `isSaving` flag and a `try/catch` at
every call site that guards a destructive request. Extracting it over `Dialog` is the other common
move, and `Dialog` is the wrong primitive: it closes when you click outside, so a destructive
confirmation is one stray click away from being dismissed, and it has nothing that waits for a
request.

- **The right primitive: `alert-dialog`.** Outside clicks are ignored, focus is trapped, the role is
  `alertdialog` and the title and description are wired to it.
- **It waits.** Hand it an async `onconfirm` and the dialog stays put until the promise settles.
- **It survives failure.** A rejected promise leaves the dialog open, so the error has somewhere to
  be reported and the reader can try again.
- **One click, one write:** a second click while the first request is in flight does nothing.
- **Escape stops meaning "cancel"** while a request is on its way to the server.

<Preview demo={basicDemo} />

## When to use

**Use it when**

- One click is about to delete, revoke or overwrite something, and the reader should say yes first.
- The action is a request that can fail, and the failure has to be read before anything closes.
- The reader must type or tick something before the action is allowed, like a project's name.

**Reach for something else when**

- The action is safe to run on one click and only needs a busy state: use
  [Action button](/docs/kit/action-button).
- The dialog holds a form with several fields, or should dismiss on an outside click: use
  [Responsive dialog](/docs/kit/responsive-dialog), or shadcn's `Dialog`.
- The outcome only needs to be reported after the fact, with an undo: a toast says it without
  stopping the reader.

## Usage

```svelte
<script lang="ts">
	import ConfirmDialog from '#lib/components/coral/kit/confirm-dialog/confirm-dialog.svelte';
</script>
```

```svelte
<ConfirmDialog
	title="Revoke this API key?"
	description="Requests signed with it start failing immediately."
	confirmLabel="Revoke"
	variant="destructive"
	onconfirm={() => apiKeys.revoke(key.id)}
>
	{#snippet trigger({ props })}
		<Button {...props} variant="outline">Revoke key</Button>
	{/snippet}
</ConfirmDialog>
```

## Examples

### Opening it

Two ways, and the choice is usually made for you:

- **A `trigger` snippet** when the dialog belongs to a button that is right there. Spread `props`
  onto whatever you render.
- **`bind:open`** when the dialog belongs to a row menu, a table action, or anything that decides to
  ask _after_ something else was clicked. This is the common case in a list screen.

### Waiting, and failing

<Preview demo={asyncDemo} />

That demo fails the first time and succeeds after. Nothing closes on the failure: the buttons come
back, the reader reads the error, and pressing the button again retries.

The rule is one line: **return `false`, or throw, to keep it open**.

```svelte
<ConfirmDialog
	title="Delete {deployment.name}?"
	description="It can't be deleted while a build is still running."
	variant="destructive"
	confirmLabel="Delete"
	onconfirm={async () => {
		try {
			await deployments.remove(deployment.id);
			toast.success(`${deployment.name} was deleted.`);
		} catch (err) {
			toast.error(normalizeError(err).message);
			return false; // stays open, so they can retry
		}
	}}
/>
```

Catching inside `onconfirm` is the shape to aim for: it puts the message where the reader is
looking. Letting the error propagate instead also keeps the dialog open, but it surfaces as an
unhandled rejection rather than as something a person can read. Pass `onerror` and what was thrown
goes there instead.

While the promise is pending both buttons are disabled, the confirm button carries a spinner, and
Escape is ignored. Letting Escape through would read as _cancelled_ for a delete already on its way
to the server. A caller that already tracks the request can pass `pending` and drive that state
itself.

### Extra detail in the body

Anything between the description and the buttons: what exactly is about to change.

<Preview demo={detailsDemo} />

### Confirm only once the body is complete

Some confirmations ask for something first: a reason, or the name of the project about to be
deleted. Checking inside `onconfirm` and returning `false` keeps the dialog open, but the button
looks armed the whole time and the reader finds out it was not only after clicking. For a
destructive action, a button that looks ready when it is not is the wrong signal.

<Preview demo={typeToConfirmDemo} />

`confirmDisabled` holds the confirm button back until the body says so. Cancel stays available
throughout, because a reader who cannot finish still needs a way out.

### Acknowledge-only

`showCancel={false}` leaves a dialog that can only be agreed with. Escape still closes it, so it is
a nudge and not a trap.

<Preview demo={acknowledgeDemo} />

## Props

Everything the shadcn alert-dialog root accepts stays available: `open`, `onOpenChange`. On top of
that:

| Prop              | Type                       | Default     | Description                                                      |
| ----------------- | -------------------------- | ----------- | ---------------------------------------------------------------- |
| `title`           | `string`                   | -           | The question. Required.                                          |
| `description`     | `string`                   | -           | What changes, and whether it can be undone.                      |
| `onconfirm`       | `() => unknown`            | -           | Runs on confirm. Return `false` or throw to keep it open.        |
| `oncancel`        | `() => void`               | -           | Runs on cancel button or Escape. Never on confirm.               |
| `confirmLabel`    | `string`                   | `Continue`  | Label for the button that goes ahead.                            |
| `cancelLabel`     | `string`                   | `Cancel`    | Label for the button that backs out.                             |
| `showCancel`      | `boolean`                  | `true`      | Set `false` for acknowledge-only.                                |
| `variant`         | `ButtonVariant`            | `'default'` | Confirm button variant. `destructive` for anything irreversible. |
| `onerror`         | `(error: unknown) => void` | -           | What `onconfirm` threw. It stays open either way.                |
| `pending`         | `boolean`                  | -           | Drive the busy state yourself. Otherwise it tracks `onconfirm`.  |
| `confirmDisabled` | `boolean`                  | `false`     | Holds confirm back while the body is incomplete. Cancel stays.   |
| `open`            | `boolean`                  | `false`     | Bindable.                                                        |
| `size`            | `'default'` \| `'sm'`      | `'default'` | Forwarded to the content.                                        |
| `class`           | `string`                   | -           | Merged onto the content.                                         |
| `trigger`         | `Snippet<[{ props }]>`     | -           | The element that opens it.                                       |
| `children`        | `Snippet`                  | -           | Extra content between description and buttons.                   |

## Keyboard

Focus moves into the dialog when it opens and stays there until it closes.

| Key                     | Action                                                                  |
| ----------------------- | ----------------------------------------------------------------------- |
| `Tab` / `Shift` + `Tab` | Moves between the controls inside the dialog, wrapping at either end.   |
| `Enter` / `Space`       | Presses the focused button.                                             |
| `Escape`                | Closes the dialog and runs `oncancel`. Ignored while a request is open. |

## Accessibility

- **Role and name.** `role="alertdialog"`, `aria-modal`, and `aria-labelledby` / `aria-describedby`
  pointing at the title and description, all from the primitive, all verified.
- **Focus.** Focus is trapped: Tab cycles inside the dialog and cannot reach the page behind it. On
  close it returns to the element that was focused before the dialog opened. Outside clicks are
  ignored by design, which is the difference between `alert-dialog` and `dialog`.
- **A disabled cancel that says so.** The cancel button is rendered through the primitive's `child`
  snippet for one reason: passed `disabled` directly, the primitive keeps the flag for its own close
  handler and never puts it on the element, leaving a button that looks pressable and does nothing.
  Going through `child` puts the attribute where a keyboard and a screen reader can both see it.

## Customizing

- **`class`** is merged onto the dialog content, and `size` is forwarded to it. `variant` styles the
  confirm button through the theme's own button variants.
- **`trigger`** renders whatever opens the dialog, and **`children`** whatever sits between the
  description and the buttons.
- **Project-wide copy.** `confirmLabel` and `cancelLabel` can be stated once with
  [`setCoralDefaults`](/docs/conventions#project-wide-defaults) under `'kit/confirm-dialog'`; a
  label passed at a call site still wins.

### The pieces

The waiting and the "return `false` or throw" rule live in `lib/action.svelte.ts`, an `Action` class
with a reactive `running` flag and a `run()` that refuses a second call while one is in flight. It
is what to reach for when a confirmation outgrows this component and you build your own over
shadcn's `AlertDialog`. That rebuild owes the reader what this page lists: the busy state on both
buttons, Escape ignored while a request is open, a close that waits for the promise, and the cancel
button's `disabled` put on the element through `child`.

### Why flat props

There is a canonical case, and nearly every call site is exactly it: a question, a consequence, two
buttons. What varies (the trigger, extra body detail) is a snippet, so the
[conventions](/docs/conventions) are satisfied without a prop for every variation.

The one thing deliberately not here is a promise-returning `confirm()` helper you could `await` in
an event handler. It reads well in a single call site and badly everywhere else: the dialog has to be
mounted, so a list screen ends up with one mounted per row.
