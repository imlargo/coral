/**
 * @coral/blocks/form-dialog
 * @version 1.0.0
 */

import { render } from 'vitest-browser-svelte';
import { userEvent } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import Harness from './form-dialog-harness.test.svelte';

const dialog = () => document.querySelector<HTMLElement>('[role="dialog"]');
const email = () => document.querySelector<HTMLInputElement>('input[type="email"]')!;
const button = (label: string) =>
	Array.from(document.querySelectorAll('button')).find(
		(entry) => entry.textContent?.trim() === label
	);
const alert = () => document.querySelector('[data-slot="alert"]');

function deferred<T = unknown>() {
	let resolve!: (value: T) => void;
	let reject!: (reason: unknown) => void;
	const promise = new Promise<T>((yes, no) => {
		resolve = yes;
		reject = no;
	});
	return { promise, resolve, reject };
}

describe('opening', () => {
	it("opens from its trigger on the record's values, with focus on the first field", async () => {
		const props = $state({
			record: { email: 'wei@example.com', role: 'admin' },
			onsubmit: vi.fn()
		});
		await render(Harness, props);
		await userEvent.click(button('Invite')!);
		await expect.poll(dialog).not.toBeNull();
		expect(email().value).toBe('wei@example.com');
		await expect.poll(() => document.activeElement).toBe(email());
	});

	it('reseeds from the record on every opening, so another record never shows the last one', async () => {
		const props = $state({
			record: { email: 'a@example.com', role: 'viewer' },
			open: true,
			onsubmit: vi.fn()
		});
		await render(Harness, props);
		await expect.poll(dialog).not.toBeNull();
		await userEvent.fill(email(), 'typed@example.com');
		await userEvent.click(button('Cancel')!);
		await expect.poll(() => button('Discard')).toBeDefined();
		await userEvent.click(button('Discard')!);
		await expect.poll(dialog).toBeNull();

		props.record = { email: 'b@example.com', role: 'admin' };
		props.open = true;
		await expect.poll(dialog).not.toBeNull();
		expect(email().value).toBe('b@example.com');
	});
});

describe('submitting', () => {
	it('sends once, waits, and closes when it resolves', async () => {
		const request = deferred();
		const onsubmit = vi.fn(() => request.promise);
		const props = $state({ open: true, onsubmit });
		await render(Harness, props);
		await expect.poll(dialog).not.toBeNull();

		await userEvent.fill(email(), 'amara@example.com');
		await userEvent.click(button('Save')!);
		// Straight to the element: the busy button is `aria-disabled`, which a real click still reaches.
		button('Save')!.click();
		expect(onsubmit).toHaveBeenCalledTimes(1);
		expect(onsubmit).toHaveBeenCalledWith({ email: 'amara@example.com', role: 'viewer' });
		expect(props.open).toBe(true);

		request.resolve(undefined);
		await expect.poll(() => props.open).toBe(false);
	});

	it('keeps the input, shows the failure beside the fields and focuses the invalid one', async () => {
		const props = $state({ open: true, onsubmit: vi.fn(() => false) });
		await render(Harness, props);
		await expect.poll(dialog).not.toBeNull();

		await userEvent.fill(email(), 'not-an-email');
		await userEvent.click(button('Save')!);
		await expect.poll(alert).not.toBeNull();
		expect(alert()?.textContent).toContain('Could not save');
		expect(email().value).toBe('not-an-email');
		await expect.poll(() => document.activeElement).toBe(email());
		expect(props.open).toBe(true);
	});

	it('submits from Enter in a field', async () => {
		const onsubmit = vi.fn();
		const props = $state({ open: true, onsubmit });
		await render(Harness, props);
		await expect.poll(dialog).not.toBeNull();
		await userEvent.fill(email(), 'kenji@example.com');
		await userEvent.keyboard('{Enter}');
		await expect.poll(() => onsubmit.mock.calls.length).toBe(1);
	});
});

describe('leaving', () => {
	it('closes at once when nothing was typed', async () => {
		const oncancel = vi.fn();
		const props = $state({ open: true, onsubmit: vi.fn(), oncancel });
		await render(Harness, props);
		await expect.poll(dialog).not.toBeNull();
		await userEvent.click(button('Cancel')!);
		await expect.poll(() => props.open).toBe(false);
		expect(oncancel).toHaveBeenCalledTimes(1);
	});

	it('asks before throwing typed input away, on Cancel and on Escape, and can keep editing', async () => {
		const props = $state({ open: true, onsubmit: vi.fn() });
		await render(Harness, props);
		await expect.poll(dialog).not.toBeNull();
		await userEvent.fill(email(), 'half@');

		await userEvent.keyboard('{Escape}');
		await expect.poll(() => button('Keep editing')).toBeDefined();
		expect(props.open).toBe(true);
		await userEvent.click(button('Keep editing')!);
		await expect.poll(() => button('Keep editing')).toBeUndefined();
		expect(email().value).toBe('half@');

		await userEvent.click(button('Cancel')!);
		await expect.poll(() => button('Discard')).toBeDefined();
		await userEvent.click(button('Discard')!);
		await expect.poll(() => props.open).toBe(false);
	});
});
