---
title: Copy button
description: Copies text to the clipboard, says so out loud, and says so when it could not.
---

<script lang="ts">
	import Preview from '$lib/docs/preview.svelte';
</script>

The five-line version - `navigator.clipboard.writeText`, a `copied` flag, a `setTimeout` - is the
one every project writes, and it has four holes: it throws on any page not served over `https`, a
screen reader never hears that anything happened, the timer keeps running after the component is
gone, and a failure looks exactly like a success.

<Preview name="kit/copy-button/basic" />

## What Coral adds

- **A fallback where the Clipboard API is missing.** Plain `http` on a LAN address, an embedded
  webview: the selection-based copy is tried, and the reader's own selection and focus are put
  back afterwards.
- **Failure is a state.** `failed` is drawn, announced and reported to `onerror`, instead of a check
  mark for a copy that never happened.
- **It is heard.** Success and failure go through a polite status region. Changing the button's own
  `aria-label`, which is how most copy buttons do it, is not announced on the element that has focus.
- **Text resolved on click.** Pass a function and it runs when the button is pressed - for a signed
  URL, or an editor's current contents - with a `copying` state while it resolves.
- **No leaked timers.** A reset scheduled before unmount is cancelled with it.

## With text

The `children` snippet receives the status, so the label can change with it. With visible text the
accessible name comes from the text, and `label` is not applied.

<Preview name="kit/copy-button/with-text" />

## Text computed on click

<Preview name="kit/copy-button/lazy" />

`status` is bindable, so something beside the button can react to it. A copy that is still resolving
ignores further clicks.

## Installation

```bash
pnpm dlx shadcn-svelte@latest add button
```

```svelte
<script lang="ts">
	import CopyButton from '$lib/coral/kit/copy-button/copy-button.svelte';
</script>
```

## Props

Everything the shadcn button accepts stays available - `variant`, `size`, `disabled`, `class`,
`aria-*`, `ref`. On top of that:

| Prop          | Type                                          | Default             | Description                                                   |
| ------------- | --------------------------------------------- | ------------------- | ------------------------------------------------------------- |
| `text`        | `string \| () => string \| Promise<string>`   | -                   | What gets copied. Required. A function runs on click.         |
| `timeout`     | `number`                                      | `2000`              | Milliseconds before `copied` or `failed` goes back to `idle`. |
| `status`      | `'idle' \| 'copying' \| 'copied' \| 'failed'` | `'idle'`            | Bindable.                                                     |
| `oncopy`      | `(text: string) => void`                      | -                   | The text reached the clipboard.                               |
| `onerror`     | `(error: unknown) => void`                    | -                   | It did not.                                                   |
| `onclick`     | `(event: MouseEvent) => void`                 | -                   | Runs first. `preventDefault` skips the copy.                  |
| `label`       | `string`                                      | `Copy to clipboard` | Accessible name when there is no visible text.                |
| `copiedLabel` | `string`                                      | `Copied`            | Announced on success.                                         |
| `failedLabel` | `string`                                      | `Copy failed`       | Announced on failure.                                         |
| `children`    | `Snippet<[{ status }]>`                       | -                   | Replaces the icon.                                            |

## Accessibility

A native `<button type="button">`, so it never submits a surrounding form. The result is announced
through `role="status"`, placed outside the button so it is not also read as part of its name.
`aria-busy` is set while a function source is resolving.

## clipboard.ts

`writeText` and `resolveText` are exported on their own, for copying from somewhere that is not a
button - a keyboard shortcut, a context menu item.

```ts
import { writeText } from '$lib/coral/kit/copy-button/clipboard.js';

await writeText(deployment.url); // rejects when the text did not reach the clipboard
```
