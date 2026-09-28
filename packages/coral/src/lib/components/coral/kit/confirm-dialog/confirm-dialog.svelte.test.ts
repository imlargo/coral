/**
 * @coral/kit/confirm-dialog
 * @version 1.0.0
 */

import { render } from 'vitest-browser-svelte';
import { userEvent } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import ConfirmDialog from './confirm-dialog.svelte';
import type { ConfirmDialogProps } from './types.js';

const button = (label: string) =>
	Array.from(document.querySelectorAll('button')).find(
		(candidate) => candidate.textContent?.trim() === label
	) as HTMLButtonElement | undefined;
const dialog = () => document.querySelector('[role="alertdialog"]');

/** A promise the test settles by hand, so the in-flight state can be looked at. */
function deferred<T = unknown>() {
	let resolve!: (value: T) => void;
	let reject!: (reason: unknown) => void;
	const promise = new Promise<T>((yes, no) => {
		resolve = yes;
		reject = no;
	});
	return { promise, resolve, reject };
}

/** State is declared in a variable first: `$state` is only valid as an initialiser. */
function open(extra: Partial<ConfirmDialogProps> = {}) {
	const props = $state({ open: true, title: 'Delete project', confirmLabel: 'Delete', ...extra });
	return props;
}

describe('confirming', () => {
	it('names the question and closes when there is nothing to wait for', async () => {
		const props = open();
		await render(ConfirmDialog, props);
		expect(dialog()?.textContent).toContain('Delete project');

		await userEvent.click(button('Delete')!);
		await expect.poll(() => props.open).toBe(false);
	});

	it('waits on the request and closes once it resolves', async () => {
		const request = deferred();
		const props = open({ onconfirm: () => request.promise });
		await render(ConfirmDialog, props);

		await userEvent.click(button('Delete')!);
		await expect.poll(() => button('Delete')?.disabled).toBe(true);
		expect(button('Cancel')?.disabled).toBe(true);
		expect(props.open).toBe(true);

		request.resolve(undefined);
		await expect.poll(() => props.open).toBe(false);
	});

	it('does not submit twice while the first request is out', async () => {
		const request = deferred();
		const onconfirm = vi.fn(() => request.promise);
		await render(ConfirmDialog, open({ onconfirm }));

		await userEvent.click(button('Delete')!);
		await expect.poll(() => button('Delete')?.disabled).toBe(true);
		button('Delete')!.click();
		expect(onconfirm).toHaveBeenCalledTimes(1);
		request.resolve(undefined);
	});

	it('stays open when the handler returns exactly false', async () => {
		const onconfirm = vi.fn(() => false);
		const props = open({ onconfirm });
		await render(ConfirmDialog, props);

		await userEvent.click(button('Delete')!);
		await expect.poll(() => onconfirm.mock.calls.length).toBe(1);
		await expect.poll(() => button('Delete')?.disabled).toBe(false);
		expect(props.open).toBe(true);
	});

	it('stays open and reports it when the handler throws', async () => {
		const failure = new Error('409');
		const onerror = vi.fn();
		const props = open({
			onconfirm: () => {
				throw failure;
			},
			onerror
		});
		await render(ConfirmDialog, props);

		await userEvent.click(button('Delete')!);
		await expect.poll(() => onerror.mock.calls.length).toBe(1);
		expect(onerror).toHaveBeenCalledWith(failure);
		expect(props.open).toBe(true);
	});

	it('lets any other return value, including none, close it', async () => {
		const props = open({ onconfirm: () => 'deleted' });
		await render(ConfirmDialog, props);

		await userEvent.click(button('Delete')!);
		await expect.poll(() => props.open).toBe(false);
	});
});

describe('backing out', () => {
	it('reports the cancel button, and closes', async () => {
		const oncancel = vi.fn();
		const props = open({ oncancel });
		await render(ConfirmDialog, props);

		await userEvent.click(button('Cancel')!);
		await expect.poll(() => props.open).toBe(false);
		expect(oncancel).toHaveBeenCalledTimes(1);
	});

	it('reports Escape as backing out', async () => {
		const oncancel = vi.fn();
		const props = open({ oncancel });
		await render(ConfirmDialog, props);

		await userEvent.keyboard('{Escape}');
		await expect.poll(() => props.open).toBe(false);
		expect(oncancel).toHaveBeenCalledTimes(1);
	});

	it('does not report a confirm as backing out', async () => {
		const oncancel = vi.fn();
		const props = open({ oncancel });
		await render(ConfirmDialog, props);

		await userEvent.click(button('Delete')!);
		await expect.poll(() => props.open).toBe(false);
		expect(oncancel).not.toHaveBeenCalled();
	});

	it('ignores Escape while a request is out', async () => {
		const request = deferred();
		const props = open({ onconfirm: () => request.promise });
		await render(ConfirmDialog, props);

		await userEvent.click(button('Delete')!);
		await expect.poll(() => button('Delete')?.disabled).toBe(true);
		await userEvent.keyboard('{Escape}');
		expect(props.open).toBe(true);
		request.resolve(undefined);
	});

	it('leaves a click outside alone', async () => {
		const props = open();
		await render(ConfirmDialog, props);

		document.querySelector<HTMLElement>('[data-slot="alert-dialog-overlay"]')?.click();
		await new Promise((resolve) => setTimeout(resolve, 50));
		expect(props.open).toBe(true);
	});
});

describe('shape', () => {
	it('drops the cancel button on request', async () => {
		await render(ConfirmDialog, open({ showCancel: false }));
		expect(button('Cancel')).toBeUndefined();
		expect(button('Delete')).toBeDefined();
	});

	it('shows the description under the title', async () => {
		await render(ConfirmDialog, open({ description: 'This cannot be undone.' }));
		expect(dialog()?.textContent).toContain('This cannot be undone.');
	});

	it('lets a caller who tracks the request say it is busy', async () => {
		await render(ConfirmDialog, open({ pending: true }));
		expect(button('Delete')?.disabled).toBe(true);
		expect(button('Cancel')?.disabled).toBe(true);
	});
});
