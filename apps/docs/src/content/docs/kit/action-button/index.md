---
title: Action button
description: A button that waits on its own request, blocks the second click, and keeps focus.
group: Kit
---

<script lang="ts">
	import Preview from '#lib/features/docs/components/Preview.svelte';
	import basicDemo from './demos/basic.svelte?demo';
	import failureDemo from './demos/failure.svelte?demo';
</script>

`let saving = $state(false)`, a `try/finally`, `disabled={saving}` and a spinner: short enough to
write inline every time, and that inline version has a bug. Disabling the button that has focus drops
focus to the page body, so a keyboard user who pressed Enter is thrown back to the top of the page
the moment the request starts.

Action button waits on the promise `onclick` returns: clicks while it is pending do nothing, and a
submit button that is busy does not submit its form again.

<Preview demo={basicDemo} />

## When to use

**Use it when**

- A button starts a request the reader waits on: a deploy, a save, a sync.
- A second click would send the same write twice.
- A form's pending state is tracked elsewhere and the submit button should show it, through
  `pending`.

**Reach for something else when**

- The action is destructive and needs a second thought: [confirm dialog](/docs/kit/confirm-dialog)
  runs the same handler convention behind a confirmation.
- The button navigates. `href` is left out on purpose; use the shadcn `Button` with `href`.
- It copies text: [copy button](/docs/kit/copy-button).
- It saves one value edited in place: [inline edit](/docs/kit/inline-edit).

## Usage

```svelte
<script lang="ts">
	import ActionButton from '#lib/components/coral/kit/action-button/action-button.svelte';

	async function deploy() {
		await fetch('/api/deployments', { method: 'POST' });
	}
</script>

<ActionButton onclick={deploy}>Deploy to production</ActionButton>
```

## Examples

### When it fails

<Preview demo={failureDemo} />

The same convention as [confirm dialog](/docs/kit/confirm-dialog): return `false` or throw and
`onsuccess` is skipped. `onerror` receives what was thrown. Without `onerror`, a thrown error
propagates as an unhandled rejection, visible in the console and to nobody using the page. Catching
inside `onclick` and returning `false` works just as well.

### Pending from outside

For a form submitted with SvelteKit's `enhance`, the form is what is pending, not the click: pass
`pending` and let the form action drive it. While `pending` is set it wins over the button's own
state, and a busy submit button cancels the click instead of submitting again.

### Disabled

`disabled` is the shadcn button's own and still disables it for real. Busy is a different state:
see **Accessibility** below.

## Props

Everything the shadcn button accepts stays available: `variant`, `size`, `type`, `form`,
`disabled`, `class`, `aria-*`, `ref`. On top of that:

| Prop           | Type                             | Default   | Description                                             |
| -------------- | -------------------------------- | --------- | ------------------------------------------------------- |
| `onclick`      | `(event: MouseEvent) => unknown` | -         | Return a promise to wait on it. `false` or throw fails. |
| `onsuccess`    | `() => void`                     | -         | `onclick` went through.                                 |
| `onerror`      | `(error: unknown) => void`       | -         | Receives what `onclick` threw.                          |
| `pending`      | `boolean`                        | -         | Drive the busy state yourself.                          |
| `pendingLabel` | `string`                         | `Loading` | Announced while busy.                                   |
| `children`     | `Snippet<[{ pending }]>`         | -         | The label.                                              |

## Keyboard

The button is a native `<button>`, so the keyboard is the browser's. Coral keeps it reachable while
busy instead of disabling it.

| Key               | Action                                                   |
| ----------------- | -------------------------------------------------------- |
| `Enter` / `Space` | Runs `onclick`. Does nothing while a request is pending. |

## Accessibility

- **Focus stays.** Busy is `aria-disabled` plus a click guard, not `disabled`, so the button keeps
  focus and is announced as unavailable. It also carries `aria-busy` while it waits.
- **Announced.** A polite status message, `pendingLabel`, says it is working; the spinner itself is
  hidden, because anything inside a button is presentational and never read.
- **The status sits outside the button**, so the message is not read again as part of the button's
  name.

## Customizing

- `class` lands on the shadcn button, merged with Coral's `cursor-progress` while busy. The button
  also carries `data-pending` while busy, for styling the wait from your own CSS.
- `children` receives `{ pending }`, for a label that says "Deploying…" while it waits.
- `pendingLabel` can be set once for the project with
  [`setCoralDefaults`](/docs/conventions#project-wide-defaults) under `kit/action-button`.

Dropping to the raw shadcn `Button` means rebuilding the click guard, the `aria-disabled` swap that
keeps focus, the spinner and the status region.

### lib/action

The pending flag, the double-submit guard and the `false`-or-throw convention live in
`lib/action.svelte.ts`, and every Coral component that waits on a request reads them from there:
this button, confirm dialog, inline edit and the stepper's Next.
