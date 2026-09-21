---
title: Action button
description: A button that waits on its own request, blocks the second click, and keeps focus.
---

<script lang="ts">
	import Preview from '$docs/preview.svelte';
</script>

`let saving = $state(false)`, a `try/finally`, `disabled={saving}` and a spinner: short enough to
write inline every time, and that inline version has a bug. Disabling the button that has focus drops
focus to the page body, so a keyboard user who pressed Enter is thrown back to the top of the page
the moment the request starts.

<Preview name="kit/action-button/basic" />

## What Coral adds

- **One click, one request:** clicks while the promise is pending do nothing, and a submit button
  that is busy does not submit its form again.
- **Focus stays.** Busy is `aria-disabled` plus a click guard, not `disabled`, so the button keeps
  focus and is announced as unavailable.
- **Announced.** A polite status message says it is working; the spinner itself is hidden, because
  anything inside a button is presentational and never read.
- **Failure has a place to go.** The same convention as [confirm dialog](/docs/kit/confirm-dialog):
  return `false` or throw and `onsuccess` is skipped. `onerror` receives what was thrown.

## When it fails

<Preview name="kit/action-button/failure" />

Without `onerror`, a thrown error propagates as an unhandled rejection, visible in the console and
to nobody using the page. Catching inside `onclick` and returning `false` works just as well.

For a form submitted with SvelteKit's `enhance`, the form is what is pending, not the click: pass
`pending` and let the form action drive it.

## Installation

```bash
pnpm dlx shadcn-svelte@latest add button spinner
```

```svelte
<script lang="ts">
	import ActionButton from '$lib/components/coral/kit/action-button/action-button.svelte';
</script>
```

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

## lib/action

The pending flag, the double-submit guard and the `false`-or-throw convention live in
`lib/action.svelte.ts`, and every Coral component that waits on a request reads them from there:
this button, confirm dialog, inline edit and the stepper's Next.
