/**
 * @coral/kit/file-upload
 * @version 1.0.0
 */

import { render } from 'vitest-browser-svelte';
import { userEvent } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import FileUpload from './file-upload.svelte';
import type { UploadContext } from './queue.svelte.js';

const input = () => document.querySelector<HTMLInputElement>('input[type="file"]')!;
const rows = () => Array.from(document.querySelectorAll<HTMLElement>('[data-slot="attachment"]'));
const button = (label: string) =>
	Array.from(document.querySelectorAll<HTMLButtonElement>('button')).find(
		(entry) => entry.getAttribute('aria-label') === label
	);
const announced = () =>
	Array.from(document.querySelectorAll('span[role="status"]')).map((r) => r.textContent?.trim());

/** Handlers the test drives by hand, in the order they were started. */
function manual() {
	const started: {
		context: UploadContext;
		resolve: (v: string) => void;
		reject: (e: unknown) => void;
	}[] = [];
	const upload = vi.fn(
		(_file: File, context: UploadContext) =>
			new Promise<string>((resolve, reject) => {
				started.push({ context, resolve, reject });
				context.signal.addEventListener('abort', () => reject(new Error('aborted')));
			})
	);
	return { upload, started };
}

const draw = (props: Record<string, unknown>) => render(FileUpload, props as never);

describe('sending what was picked', () => {
	it('starts sending as soon as files are picked, and empties the input', async () => {
		const { upload, started } = manual();
		await draw({ upload, 'aria-label': 'Attachments', multiple: true, concurrency: 1 });
		await userEvent.upload(input(), [new File(['a'], 'roadmap.pdf'), new File(['b'], 'notes.txt')]);

		await expect.poll(() => rows().length).toBe(2);
		expect(started).toHaveLength(1);
		expect(rows()[0].dataset.state).toBe('uploading');
		expect(rows()[1].dataset.state).toBe('idle');
		expect(input().files?.length ?? 0).toBe(0);
	});

	it("shows each file's real progress, then done", async () => {
		const { upload, started } = manual();
		await draw({ upload, 'aria-label': 'Attachments' });
		await userEvent.upload(input(), new File(['a'], 'roadmap.pdf'));
		await expect.poll(() => started.length).toBe(1);

		started[0].context.onprogress(0.4);
		await expect.poll(() => rows()[0].textContent).toContain('40%');
		expect(document.querySelector('[data-slot="progress"]')).not.toBeNull();

		started[0].resolve('https://cdn/roadmap.pdf');
		await expect.poll(() => rows()[0].dataset.state).toBe('done');
		expect(document.querySelector('[data-slot="progress"]')).toBeNull();
	});
});

describe('one file at a time', () => {
	it('cancels by aborting the request, and offers to send it again', async () => {
		const { upload, started } = manual();
		await draw({ upload, 'aria-label': 'Attachments' });
		await userEvent.upload(input(), new File(['a'], 'roadmap.pdf'));
		await expect.poll(() => button('Cancel uploading roadmap.pdf')).toBeDefined();

		await userEvent.click(button('Cancel uploading roadmap.pdf')!);
		expect(started[0].context.signal.aborted).toBe(true);
		await expect.poll(() => rows()[0].textContent).toContain('Cancelled');

		await userEvent.click(button('Retry uploading roadmap.pdf')!);
		await expect.poll(() => upload.mock.calls.length).toBe(2);
		expect(rows()).toHaveLength(1);
	});

	it('keeps a failure on its own row, says the batch tally, and lets the row go', async () => {
		const { upload, started } = manual();
		const onsettle = vi.fn();
		await draw({ upload, onsettle, 'aria-label': 'Attachments', multiple: true });
		await userEvent.upload(input(), [new File(['a'], 'a.txt'), new File(['b'], 'b.txt')]);
		await expect.poll(() => started.length).toBe(2);

		started[0].reject(new Error('413'));
		started[1].resolve('ok');
		await expect.poll(() => rows().map((row) => row.dataset.state)).toEqual(['error', 'done']);
		expect(rows()[0].textContent).toContain('Upload failed');
		await expect.poll(announced).toContain('1 uploaded, 1 failed');
		expect(onsettle).toHaveBeenCalledWith({ done: 1, failed: 1, cancelled: 0 }, expect.any(Array));

		await userEvent.click(button('Remove a.txt')!);
		await expect.poll(() => rows().length).toBe(1);
	});

	it('exposes the uploads and reports each one that landed', async () => {
		const { upload, started } = manual();
		const onupload = vi.fn();
		const props = $state({
			upload,
			onupload,
			uploads: [] as unknown[],
			'aria-label': 'Attachments'
		});
		await draw(props);
		await userEvent.upload(input(), new File(['a'], 'a.txt'));
		await expect.poll(() => started.length).toBe(1);
		started[0].resolve('https://cdn/a.txt');

		await expect.poll(() => onupload).toHaveBeenCalled();
		expect(props.uploads).toHaveLength(1);
		expect(props.uploads[0]).toMatchObject({ status: 'done', result: 'https://cdn/a.txt' });
	});
});
