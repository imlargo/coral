/**
 * @coral/kit/file-upload
 * @version 1.0.0
 */

import { describe, expect, it, vi } from 'vitest';
import { UploadQueue } from './queue.svelte.js';
import type { UploadContext } from './queue.svelte.js';

const file = (name: string) => new File(['x'], name);

/** Handlers the test settles by hand, one per file, in the order they were started. */
function manual() {
	const started: {
		file: File;
		context: UploadContext;
		resolve: (v: string) => void;
		reject: (e: unknown) => void;
	}[] = [];
	const upload = vi.fn(
		(entry: File, context: UploadContext) =>
			new Promise<string>((resolve, reject) => {
				started.push({ file: entry, context, resolve, reject });
				context.signal.addEventListener('abort', () => reject(new Error('aborted')));
			})
	);
	return { upload, started };
}

const settle = () => new Promise((resolve) => setTimeout(resolve, 0));

describe('UploadQueue', () => {
	it('sends at most `concurrency` files at once, and the rest as slots free up', async () => {
		const { upload, started } = manual();
		const queue = new UploadQueue({ upload, concurrency: () => 2 });
		queue.add([file('a'), file('b'), file('c')]);

		expect(started.map((entry) => entry.file.name)).toEqual(['a', 'b']);
		expect(queue.uploads.map((entry) => entry.status)).toEqual([
			'uploading',
			'uploading',
			'queued'
		]);

		started[0].resolve('https://cdn/a');
		await settle();
		expect(started.map((entry) => entry.file.name)).toEqual(['a', 'b', 'c']);
		expect(queue.uploads[0]).toMatchObject({
			status: 'done',
			progress: 1,
			result: 'https://cdn/a'
		});
	});

	it('reports progress per file, clamped', async () => {
		const { upload, started } = manual();
		const queue = new UploadQueue({ upload, concurrency: () => 1 });
		queue.add([file('a')]);
		started[0].context.onprogress(0.4);
		expect(queue.uploads[0].progress).toBe(0.4);
		started[0].context.onprogress(1.7);
		expect(queue.uploads[0].progress).toBe(1);
	});

	it('cancels by aborting the request, and a queued file without starting it', async () => {
		const { upload, started } = manual();
		const queue = new UploadQueue({ upload, concurrency: () => 1 });
		queue.add([file('a'), file('b')]);

		queue.cancel(queue.uploads[1].id);
		expect(queue.uploads[1].status).toBe('cancelled');

		queue.cancel(queue.uploads[0].id);
		expect(started[0].context.signal.aborted).toBe(true);
		await settle();
		expect(queue.uploads[0].status).toBe('cancelled');
		expect(upload).toHaveBeenCalledTimes(1);
	});

	it('keeps one failure on its own row and lets it be retried alone', async () => {
		const { upload, started } = manual();
		const onsettle = vi.fn();
		const queue = new UploadQueue({ upload, concurrency: () => 2, onsettle });
		queue.add([file('a'), file('b')]);

		started[0].reject(new Error('413'));
		started[1].resolve('ok');
		await settle();
		expect(queue.uploads.map((entry) => entry.status)).toEqual(['failed', 'done']);
		expect(queue.uploads[0].error).toBeInstanceOf(Error);
		expect(onsettle).toHaveBeenCalledWith({ done: 1, failed: 1, cancelled: 0 }, queue.uploads);

		queue.retry(queue.uploads[0].id);
		expect(upload).toHaveBeenCalledTimes(3);
		expect(started[2].file.name).toBe('a');
		started[2].resolve('ok');
		await settle();
		expect(queue.uploads.map((entry) => entry.status)).toEqual(['done', 'done']);
		expect(onsettle).toHaveBeenCalledTimes(2);
	});

	it('removes a settled row but never one in flight', () => {
		const { upload } = manual();
		const queue = new UploadQueue({ upload, concurrency: () => 1 });
		queue.add([file('a'), file('b')]);
		const [sending, waiting] = queue.uploads.map((entry) => entry.id);

		queue.remove(sending);
		expect(queue.uploads).toHaveLength(2);
		queue.cancel(waiting);
		queue.remove(waiting);
		expect(queue.uploads).toHaveLength(1);
	});

	it('tells each finished file apart from the batch', async () => {
		const { upload, started } = manual();
		const onupload = vi.fn();
		const queue = new UploadQueue({ upload, concurrency: () => 2, onupload });
		queue.add([file('a')]);
		started[0].resolve('ok');
		await settle();
		expect(onupload).toHaveBeenCalledWith(
			expect.objectContaining({ status: 'done', result: 'ok' })
		);
	});
});
