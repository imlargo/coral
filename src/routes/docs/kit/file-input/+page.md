---
title: File input
description: Pick files by click or drop, validate them, show what was picked. An input, not an uploader.
---

<script lang="ts">
	import Preview from '$lib/docs/preview.svelte';
</script>

Eight of the nine projects in the corpus have one. Four wrote a generic wrapper, and two of those
four are forks of the same file - which is the interesting part, because one fork diverged to patch a
bug in production and the patch never travelled back to its sibling. That bug is fixed here.

<Preview name="kit/file-input/basic" />

## What Coral adds

- **The keyboard can open it.** All four wrappers in the corpus put `onclick` on a `<div>` and hide
  the input with `hidden`, which removes it from the accessibility tree. None of them can be operated
  without a mouse.
- **Drag and drop that actually works**, and stays highlighted while the pointer moves over the
  contents of the zone.
- **`accept` that does not reject valid files.** The bug below.
- **One selection, one source of truth.** `value` is the state, not a mirror of some private copy.
- **Sizes read correctly in Spanish** - `1,5 MB`, not `1.5 MB`.
- **The same file twice is once.** Every copy in the corpus appends blindly, so dropping a file again
  puts two identical rows on screen and posts it twice.

## An input, not an uploader

Coral stops at `File[]`. There is no progress, no retry, no remote URL, no queue - all of that needs
to know where the bytes are going, and Coral does not.

This is not a hypothetical boundary. Both Svelte wrappers in the corpus render a progress bar driven
by this:

```ts
// Don't. This measures nothing.
$effect(() => {
	if (files.length > 0 && uploadProgress < 100) {
		const timer = setTimeout(() => (uploadProgress = Math.min(uploadProgress + 10, 100)), 80);
		return () => clearTimeout(timer);
	}
});
```

A bar that fills at a fixed rate the moment a file is chosen, with no request behind it. They wanted
an uploader, could not have one without an API, and shipped the appearance of one instead.

The real seam is the `file` snippet: Coral holds the selection and renders the zone, the project
renders each row with whatever its own uploader knows.

<Preview name="kit/file-input/custom-row" />

## The `accept` bug

A pure MIME check looks obviously right and is wrong:

```ts
// Rejects clip.mov, which the user can plainly see is a video.
accept.split(',').some((type) => type === file.type || file.type.startsWith(category));
```

Browsers report an **empty `file.type`** for plenty of ordinary files - `.mov`, `.avi`, `.m4v`,
`.mkv` - notably on Windows, in installed PWAs, and on iOS. One project hit this in production and
forked its copy to patch it; the patch was a hardcoded table of video and image extensions, and its
sibling repo still rejects those files today.

Coral needs no table. A file the browser refuses to type can only be judged by its extension:

| `accept`         | file         | `file.type` | Result                                                                       |
| ---------------- | ------------ | ----------- | ---------------------------------------------------------------------------- |
| `video/*`        | `clip.mov`   | `''`        | **accepted** - nothing to check the MIME entry with                          |
| `.pdf,image/*`   | `clip.mov`   | `''`        | **rejected** - extensions were listed, none matched                          |
| `.mov,video/mp4` | `clip.mov`   | `''`        | **accepted** - the extension matches                                         |
| `image/*`        | `photo.png`  | `image/png` | accepted                                                                     |
| `.pdf`           | `report.pdf` | anything    | accepted - extension entries are read at all, which the corpus versions skip |

The server is the real gate either way; the point is not to turn away a file the person is looking at.

## Constraints and rejections

<Preview name="kit/file-input/constrained" />

`accept`, `maxSize` and `maxFiles` filter what gets in. What gets turned away goes to `onreject`, as
structured data:

```ts
type FileRejection = {
	file: File;
	reason: 'type' | 'size' | 'count';
};
```

**Coral renders no error text.** The message is copy, copy belongs to the project, and the corpus is
split on where it even goes - two projects render it inline, one raises a toast. Coral says what
happened and stays out of it.

The consequence to respect: **set a constraint, wire `onreject`**, or files are dropped in silence.

Every rejection is reported, not just the first - one corpus version keeps `errors[0]` and discards
the rest, so dropping five oversized files explains one of them.

### `multiple` and `maxFiles`

One number, not two. `multiple` opens the door, `maxFiles` says how many fit, and without `multiple`
the limit is 1 whatever `maxFiles` says. A single-file input **replaces** what it holds rather than
refusing the new file.

Every wrapper in the corpus carries both a `variant: 'single' | 'multiple'` and a `maxFiles`, and
defaults them to `'single'` and `5` - so the two props contradict each other before anyone touches
them.

## Accessibility

The zone is a `<label>` wrapping a real `<input type="file">` that is `sr-only` rather than `hidden`.
That single change is the difference between a picker the keyboard can open and one it cannot:

- The click is native. No `onclick`, no `.click()` call, no `a11y_click_events_have_key_events`
  suppression - all four corpus versions need one to build.
- Tab reaches the input; the zone shows the focus ring through `has-[input:focus-visible]`.
- Space and Enter open the picker, because that is what a focused file input does.

Every prop a native file input takes is forwarded to it - `id`, `required`, `capture`, `aria-*` - so
a surrounding `Field` labels it the usual way.

## Installation

```bash
pnpm dlx shadcn-svelte@latest add empty item button
```

```svelte
<script lang="ts">
	import FileInput from '$lib/coral/kit/file-input/file-input.svelte';
	import type { FileRejection } from '$lib/coral/kit/file-input/types.js';
</script>
```

## Props

Everything a native file input accepts is forwarded to it. On top of that:

| Prop          | Type                                      | Default                               | Description                              |
| ------------- | ----------------------------------------- | ------------------------------------- | ---------------------------------------- |
| `value`       | `File[]`                                  | `[]`                                  | Bindable. The selection.                 |
| `onchange`    | `(files: File[]) => void`                 | -                                     | Pick, drop or removal. Never on mount.   |
| `onreject`    | `(rejections: FileRejection[]) => void`   | -                                     | What was turned away, and why.           |
| `accept`      | `string`                                  | `''`                                  | `image/*,.pdf`. Empty takes anything.    |
| `multiple`    | `boolean`                                 | `false`                               | Allows more than one file.               |
| `maxFiles`    | `number`                                  | unbounded                             | Only read when `multiple`.               |
| `maxSize`     | `number`                                  | unbounded                             | Bytes, per file.                         |
| `disabled`    | `boolean`                                 | `false`                               | Blocks the zone and the remove buttons.  |
| `label`       | `string`                                  | `Drop files here, or click to browse` | The line inside the zone.                |
| `hint`        | `string`                                  | from `accept` + `maxSize`             | The line under it. `''` renders none.    |
| `removeLabel` | `string`                                  | `Remove file`                         | Accessible label for each remove button. |
| `class`       | `string`                                  | -                                     | Merged onto the zone - height, padding.  |
| `listClass`   | `string`                                  | -                                     | Merged onto the file list.               |
| `zone`        | `Snippet<[{ dragging, disabled, hint }]>` | -                                     | Replaces the contents of the zone.       |
| `file`        | `Snippet<[{ file, index, remove }]>`      | -                                     | Replaces each row. The uploader seam.    |

`hint` defaults to a summary built from the constraints - `PDF, IMAGE · 1 MB`. It is deliberately
wordless: extensions and categories reduce to bare tokens, so nothing in it needs translating.

## Forms

There is no `name`. Files reach the server through `value`, appended to a `FormData` by the code that
makes the request:

```ts
const body = new FormData();
for (const file of files) body.append('attachments', file);
```

Native file submission would need the hidden input's own `FileList` kept in step with `value` on
every removal, and no project in the corpus posts a form that way - all nine build the request
themselves. It stays out until one does.
