---
title: File upload
description: Picked files sent a few at a time, each with its real progress, its own cancel and retry, and a tally at the end.
group: Kit
---

<script lang="ts">
	import Preview from '#lib/features/docs/components/Preview.svelte';
	import basicDemo from './demos/basic.svelte?demo';
	import failingDemo from './demos/failing.svelte?demo';
</script>

[File input](/docs/kit/file-input) picks and validates files and stops there, on purpose: it is an
input, not an uploader. What gets written around it is the upload, and the hand-rolled version goes
wrong in the same places. Progress is faked or missing, because `fetch` reports none and wiring
`XMLHttpRequest` is left to each caller. One failure inside a batch is lost: the batch says it
succeeded, or every file is sent again. Cancel hides the row and leaves the request running. Ten
files start at once and saturate the connection or the server's limits.

<Preview demo={basicDemo} />

## When to use

**Use it when**

- Files upload the moment they are picked, each with its own progress: build artifacts, release
  assets, attachments on an issue.
- A batch can partly fail, and the reader should retry one file rather than the whole set.
- Cancelling must stop the request, not only hide the row.

**Reach for something else when**

- The files go to the server with the rest of a form on submit: [file input](/docs/kit/file-input),
  with `name` on it.
- A single request sends everything at once and reports nothing per file: file input, and your
  own `fetch` built from its `value`.

## Usage

```svelte
<script lang="ts">
	import FileUpload from '#lib/components/coral/kit/file-upload/file-upload.svelte';
	import type { UploadHandler } from '#lib/components/coral/kit/file-upload/types.js';

	const upload: UploadHandler<Response> = (file, { signal }) =>
		fetch('/api/artifacts', { method: 'POST', body: file, signal });
</script>

<FileUpload {upload} multiple />
```

Coral never fetches: `upload` receives the file, an abort signal and a progress callback, and
resolves to whatever you want back.

## Examples

### A queue, a few at a time

`concurrency` files are in flight; the rest wait their turn and start as slots free up. Progress is
real, as your handler reports it, drawn as a bar and written as a percentage that is read along
with the file.

### The handler

```ts
import type { UploadHandler } from '#lib/components/coral/kit/file-upload/types.js';

// `fetch` cannot report upload progress, so a real bar takes an XMLHttpRequest.
const upload: UploadHandler<string> = (file, { signal, onprogress }) =>
	new Promise((resolve, reject) => {
		const request = new XMLHttpRequest();
		request.open('POST', '/api/files');
		request.upload.onprogress = (event) => {
			if (event.lengthComputable) onprogress(event.loaded / event.total);
		};
		request.onload = () =>
			request.status < 300 ? resolve(JSON.parse(request.response).url) : reject(request.status);
		request.onerror = () => reject(new Error('Network error'));
		signal.addEventListener('abort', () => request.abort());
		const body = new FormData();
		body.append('file', file);
		request.send(body);
	});
```

A handler that uses `fetch` works too, with `signal` passed through and no progress until it lands.

### Failures and retries

<Preview demo={failingDemo} />

`failedMessage` receives what the handler threw, so the row can say the server's own reason. The
retry sends only that file; the tally is announced again once the batch settles.

One failure is one row. A file that did not make it says so where it sits, with the others
untouched, and the tally at the end names how many landed, failed or were stopped.

### Cancel and remove

Cancelling hands your handler an aborted signal rather than hiding the row, and the row stays with
a retry. A row that is done, failed or cancelled can be removed; one still queued or on its way can
only be cancelled.

### Disabled

`disabled` reaches the picker: no new files can be picked, dropped or pasted. Rows already in the
list keep their cancel, retry and remove controls.

## Props

Everything [file input](/docs/kit/file-input) takes stays available and reaches the input: `accept`,
`multiple`, `maxFiles`, `maxSize`, `onreject`, `label`, `hint`, `disabled`, `zone`. On top of that:

| Prop               | Type                                           | Default                    | Description                                 |
| ------------------ | ---------------------------------------------- | -------------------------- | ------------------------------------------- |
| `upload`           | `UploadHandler<R>`                             | -                          | Sends one file. Required.                   |
| `concurrency`      | `number`                                       | `3`                        | How many files are in flight at once.       |
| `uploads`          | `Upload<R>[]`                                  | `[]`                       | Bindable. Every upload and where it stands. |
| `onupload`         | `(upload: Upload<R>) => void`                  | -                          | One file landed.                            |
| `onsettle`         | `(summary, uploads) => void`                   | -                          | The batch is over.                          |
| `cancelLabel`      | `(file: File) => string`                       | `Cancel uploading {name}`  | Accessible label of a row's cancel.         |
| `retryLabel`       | `(file: File) => string`                       | `Retry uploading {name}`   | Accessible label of a row's retry.          |
| `removeLabel`      | `(file: File) => string`                       | `Remove {name}`            | Accessible label of a row's remove.         |
| `progressMessage`  | `(fraction: number) => string`                 | a percentage               | Under a file on its way.                    |
| `failedMessage`    | `(error: unknown) => string`                   | `Upload failed`            | Under a file that did not make it.          |
| `cancelledMessage` | `string`                                       | `Cancelled`                | Under a file the reader stopped.            |
| `settledMessage`   | `(summary) => string`                          | `{n} uploaded, {m} failed` | Announced once the batch is over.           |
| `listClass`        | `string`                                       | -                          | Merged onto the list of uploads.            |
| `row`              | `Snippet<[{ upload, cancel, retry, remove }]>` | -                          | Replaces each row.                          |

### Upload

| Field      | Type                                                           | Description                   |
| ---------- | -------------------------------------------------------------- | ----------------------------- |
| `id`       | `string`                                                       | Stable across retries.        |
| `file`     | `File`                                                         | What is being sent.           |
| `status`   | `'queued' \| 'uploading' \| 'done' \| 'failed' \| 'cancelled'` | Where it stands.              |
| `progress` | `number`                                                       | `0` to `1`.                   |
| `result`   | `R`                                                            | What the handler resolved to. |
| `error`    | `unknown`                                                      | What it threw.                |

## Keyboard

The picker's keys are [file input](/docs/kit/file-input#keyboard)'s. The rows add their own
buttons.

| Key                  | Action                                                                               |
| -------------------- | ------------------------------------------------------------------------------------ |
| `Tab`                | Reaches the picker, then each row's controls.                                        |
| `Enter` / `Space`    | On the picker: opens the file dialog. On a row control: cancels, retries or removes. |
| `Cmd` / `Ctrl` + `V` | On the picker: queues the files on the clipboard.                                    |

## Accessibility

The picker is [file input](/docs/kit/file-input)'s, keyboard-operable as a label around a real
input. Each row is the `attachment` primitive with its state, so a failed file is drawn as one, and
its description carries the size with the progress, the failure or the cancel in words - the bar is
decoration for the same number. The cancel, retry and remove controls are real buttons named after
the file, and the tally is announced through a status region once the batch settles.

Those controls change while the reader is on them: cancel turns into retry, an upload that finishes
takes its cancel button away, a removed row takes everything. Focus never falls to the body. It
moves to the first control left in the same row, then to the row that took its place, and to the
picker once the list is empty, including in rows drawn by the `row` snippet. Files can also be
pasted into the focused picker, the way [file input](/docs/kit/file-input) takes them.

## Customizing

- `listClass` is merged onto the list of uploads. `class`, `zone`, `label` and `hint` reach the
  picker, as on [file input](/docs/kit/file-input).
- `row` replaces each row and receives `{ upload, cancel, retry, remove }`; focus is still kept in
  the list when its controls change.
- `concurrency` and every label and message (`cancelLabel`, `retryLabel`, `removeLabel`,
  `progressMessage`, `failedMessage`, `cancelledMessage`, `settledMessage`) can be set once for the
  project with [`setCoralDefaults`](/docs/conventions#project-wide-defaults) under
  `kit/file-upload`. The shared `locale` formats the default percentage.
- `uploads` is bindable, so a form can read what landed; the queue is its only writer.

The queue is `UploadQueue` in `queue.svelte.ts` beside the component: `add`, `cancel`, `retry`,
`remove`, and the summary, with no markup. A different list, such as a table of uploads, can be
built on it. The rows are the shadcn `Attachment`, `Progress` and `Spinner` over a
[file input](/docs/kit/file-input); dropping to those means rebuilding the queue, the abort on
cancel, the per-file states and the settled announcement.
