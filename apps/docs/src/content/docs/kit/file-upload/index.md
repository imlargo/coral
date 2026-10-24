---
title: File upload
description: Picked files sent a few at a time, each with its real progress, its own cancel and retry, and a tally at the end.
group: Kit
---

<script lang="ts">
	import Preview from '#lib/features/docs/components/Preview.svelte';
</script>

[File input](/docs/kit/file-input) picks and validates files and stops there, on purpose: it is an
input, not an uploader. What every project then writes around it is the upload, and the hand-rolled
version goes wrong in the same places. Progress is faked or missing, because `fetch` reports none
and each project wires `XMLHttpRequest` its own way. One failure inside a batch is lost: the batch
says it succeeded, or every file is sent again. Cancel hides the row and leaves the request running.
Ten files start at once and saturate the connection or the server's limits.

<Preview name="kit/file-upload/basic" />

## What Coral adds

- **A queue, a few at a time.** `concurrency` files are in flight; the rest wait their turn and
  start as slots free up.
- **Real progress per file**, as your handler reports it, drawn as a bar and written as a percentage
  that is read along with the file.
- **Cancel aborts, retry resends.** Cancelling hands your handler an aborted signal rather than
  hiding the row; retrying sends that one file again, on the same row.
- **One failure is one row.** A file that did not make it says so where it sits, with the others
  untouched, and the tally at the end names how many landed, failed or were stopped - announced as
  well as reported.
- **The upload is yours.** Coral never fetches: `upload` receives the file, an abort signal and a
  progress callback, and resolves to whatever you want back.

## The handler

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

## Failures and retries

<Preview name="kit/file-upload/failing" />

`failedMessage` receives what the handler threw, so the row can say the server's own reason. The
retry sends only that file; the tally is announced again once the batch settles.

## Import

```svelte
<script lang="ts">
	import FileUpload from '#lib/components/coral/kit/file-upload/file-upload.svelte';
	import type { UploadHandler } from '#lib/components/coral/kit/file-upload/types.js';
</script>
```

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

## Accessibility

The picker is [file input](/docs/kit/file-input)'s, keyboard-operable as a label around a real
input. Each row is the `attachment` primitive with its state, so a failed file is drawn as one, and
its description carries the size with the progress, the failure or the cancel in words - the bar is
decoration for the same number. The cancel, retry and remove controls are real buttons named after
the file, and the tally is announced through a status region once the batch settles.
