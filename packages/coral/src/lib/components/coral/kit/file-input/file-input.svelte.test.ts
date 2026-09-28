/**
 * @coral/kit/file-input
 * @version 1.0.0
 */

import { render } from 'vitest-browser-svelte';
import type { ComponentProps } from 'svelte';
import { userEvent } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import FileInput from './file-input.svelte';
import type { FileInputProps } from './types.js';

const renderInput = (props: FileInputProps) =>
	render(FileInput, props as unknown as ComponentProps<typeof FileInput>);

const field = () => document.querySelector<HTMLInputElement>('input[type="file"]')!;
const file = (name: string, body = 'x', type = 'text/plain') => new File([body], name, { type });

/**
 * Drops the very same `File` objects on the zone. Playwright's upload rebuilds each file from its
 * bytes, with a new `lastModified`, so it cannot stand in for a reader dropping one file twice.
 */
function drop(...files: File[]) {
	const transfer = new DataTransfer();
	for (const entry of files) transfer.items.add(entry);
	document
		.querySelector('label')!
		.dispatchEvent(
			new DragEvent('drop', { dataTransfer: transfer, bubbles: true, cancelable: true })
		);
}

describe('picking', () => {
	it('holds the file and reports it once', async () => {
		const onchange = vi.fn();
		const props = $state({ value: [] as File[], onchange });
		await renderInput(props);

		await userEvent.upload(field(), file('notes.txt'));
		await expect.poll(() => props.value.map((entry) => entry.name)).toEqual(['notes.txt']);
		expect(onchange).toHaveBeenCalledTimes(1);
	});

	it('appends to what is held when several are allowed, and drops a repeat', async () => {
		const props = $state({ value: [] as File[], multiple: true });
		await renderInput(props);
		const first = file('a.txt');

		drop(first);
		drop(file('b.txt'));
		await expect.poll(() => props.value.map((entry) => entry.name)).toEqual(['a.txt', 'b.txt']);

		drop(first);
		await new Promise((resolve) => setTimeout(resolve, 30));
		expect(props.value).toHaveLength(2);
		// The field is put back in step with the selection, not left holding only the repeat.
		expect(Array.from(field().files ?? []).map((entry) => entry.name)).toEqual(['a.txt', 'b.txt']);
	});

	it('turns away what it does not accept and says why', async () => {
		const onreject = vi.fn();
		const props = $state({ value: [] as File[], accept: 'image/*', onreject });
		await renderInput(props);

		await userEvent.upload(field(), file('notes.txt'));
		await expect.poll(() => onreject.mock.calls.length).toBe(1);
		expect(onreject.mock.calls[0][0][0].reason).toBe('type');
		expect(props.value).toEqual([]);
	});
});

describe('in a form', () => {
	it('lets the browser validate `required` against what is held', async () => {
		const props = $state({ value: [] as File[], required: true });
		await renderInput(props);
		expect(field().checkValidity()).toBe(false);

		await userEvent.upload(field(), file('notes.txt'));
		await expect.poll(() => field().checkValidity()).toBe(true);
	});

	it('is invalid again once the last file is removed', async () => {
		const props = $state({ value: [file('notes.txt')], required: true });
		await renderInput(props);
		await expect.poll(() => field().checkValidity()).toBe(true);

		await userEvent.click(document.querySelector('button[aria-label^="Remove"]')!);
		await expect.poll(() => field().checkValidity()).toBe(false);
	});

	it('submits what is held under `name`', async () => {
		document.body.insertAdjacentHTML('beforeend', '<form id="upload"></form>');
		const props = $state({
			value: [] as File[],
			multiple: true,
			name: 'attachments',
			form: 'upload'
		});
		await renderInput(props);

		await userEvent.upload(field(), [file('a.txt', 'one'), file('b.txt', 'two')]);
		await expect.poll(() => props.value.length).toBe(2);

		const body = new FormData(document.getElementById('upload') as HTMLFormElement);
		expect(body.getAll('attachments').map((entry) => (entry as File).name)).toEqual([
			'a.txt',
			'b.txt'
		]);
		document.getElementById('upload')?.remove();
	});

	it('empties when its form is reset', async () => {
		document.body.insertAdjacentHTML('beforeend', '<form id="reset-me"></form>');
		const onchange = vi.fn();
		const props = $state({ value: [file('a.txt')], form: 'reset-me', onchange });
		await renderInput(props);

		(document.getElementById('reset-me') as HTMLFormElement).reset();
		await expect.poll(() => props.value).toEqual([]);
		expect(onchange).toHaveBeenCalledWith([]);
		document.getElementById('reset-me')?.remove();
	});
});

describe('removing', () => {
	it('names each remove button after its file', async () => {
		const props = $state({ value: [file('a.txt'), file('b.txt')], multiple: true });
		await renderInput(props);

		const labels = Array.from(document.querySelectorAll('button[aria-label]')).map((button) =>
			button.getAttribute('aria-label')
		);
		expect(labels).toEqual(['Remove a.txt', 'Remove b.txt']);
	});

	it('lets the same file be picked again after it was removed', async () => {
		const props = $state({ value: [] as File[] });
		await renderInput(props);
		const picked = file('a.txt');

		await userEvent.upload(field(), picked);
		await expect.poll(() => props.value.length).toBe(1);
		await userEvent.click(document.querySelector('button[aria-label^="Remove"]')!);
		await expect.poll(() => props.value.length).toBe(0);
		expect(field().files?.length).toBe(0);

		await userEvent.upload(field(), picked);
		await expect.poll(() => props.value.length).toBe(1);
	});
});
