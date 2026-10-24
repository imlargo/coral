/**
 * @coral/blocks/settings-form
 * @version 1.0.0
 */

import { render } from 'vitest-browser-svelte';
import { userEvent } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import Harness from './settings-form-harness.test.svelte';

const name = () => document.querySelector<HTMLInputElement>('input:not([type="number"])')!;
const button = (label: string) =>
	Array.from(document.querySelectorAll('button')).find(
		(entry) => entry.textContent?.trim() === label
	);
const bar = () => document.querySelector<HTMLElement>('[data-status]');
const announced = () =>
	Array.from(document.querySelectorAll('span[role="status"]')).map((r) => r.textContent?.trim());

/** A promise the test settles by hand. */
function deferred<T = unknown>() {
	let resolve!: (value: T) => void;
	let reject!: (reason: unknown) => void;
	const promise = new Promise<T>((yes, no) => {
		resolve = yes;
		reject = no;
	});
	return { promise, resolve, reject };
}

describe('unsaved changes', () => {
	it('shows nothing until something changes, then the message and the two choices', async () => {
		await render(Harness, { onsave: vi.fn() });
		expect(bar()).toBeNull();

		await userEvent.fill(name(), 'gateway');
		await expect.poll(() => bar()?.textContent).toContain('You have unsaved changes.');
		expect(button('Save changes')?.disabled).toBe(false);
		expect(button('Discard')?.disabled).toBe(false);
	});

	it('discards back to what is saved', async () => {
		await render(Harness, { onsave: vi.fn() });
		await userEvent.fill(name(), 'gateway');
		await expect.poll(() => button('Discard')).toBeDefined();

		await userEvent.click(button('Discard')!);
		await expect.poll(() => name().value).toBe('api-gateway');
		expect(bar()).toBeNull();
	});
});

describe('saving', () => {
	it('saves the draft once, says so, and is clean once the record caught up', async () => {
		const request = deferred();
		const props = $state({
			saved: { name: 'api-gateway', seats: 3 },
			onsave: vi.fn(() => request.promise)
		});
		await render(Harness, props);

		await userEvent.fill(name(), 'gateway');
		await expect.poll(() => button('Save changes')).toBeDefined();
		await userEvent.click(button('Save changes')!);
		// Straight to the element: the busy button is `aria-disabled`, which a real click still reaches.
		button('Save changes')!.click();
		expect(props.onsave).toHaveBeenCalledTimes(1);
		expect(props.onsave).toHaveBeenCalledWith({ name: 'gateway', seats: 3 });
		await expect.poll(announced).toContain('Saving...');

		// The server answered: the project writes the record, and the form goes clean on its own.
		props.saved = { name: 'gateway', seats: 3 };
		request.resolve(undefined);
		await expect.poll(() => bar()?.textContent).toContain('Saved.');
		await expect.poll(announced).toContain('Saved.');
		await expect.poll(() => bar()).toBeNull();
	});

	it('keeps the changes and says why when the save refuses', async () => {
		await render(Harness, { onsave: vi.fn(() => false) });
		await userEvent.fill(name(), 'gateway');
		await expect.poll(() => button('Save changes')).toBeDefined();

		await userEvent.click(button('Save changes')!);
		await expect.poll(() => bar()?.textContent).toContain('Could not save.');
		expect(name().value).toBe('gateway');
		await expect.poll(announced).toContain('Could not save.');
	});

	it('hands a throw to onerror and stays dirty', async () => {
		const onerror = vi.fn();
		await render(Harness, {
			onsave: vi.fn(() => {
				throw new Error('offline');
			}),
			onerror
		});
		await userEvent.fill(name(), 'gateway');
		await expect.poll(() => button('Save changes')).toBeDefined();
		await userEvent.click(button('Save changes')!);
		await expect.poll(() => onerror).toHaveBeenCalled();
		expect(button('Save changes')?.disabled).toBe(false);
	});

	it('saves from Enter in a field and from the shortcut', async () => {
		const onsave = vi.fn();
		await render(Harness, { onsave, shortcut: 'ctrl+s' });
		await userEvent.fill(name(), 'gateway');
		await userEvent.keyboard('{Enter}');
		await expect.poll(() => onsave.mock.calls.length).toBe(1);

		await userEvent.fill(name(), 'gateway-2');
		await userEvent.keyboard('{Control>}s{/Control}');
		await expect.poll(() => onsave.mock.calls.length).toBe(2);
	});

	it('does nothing on the shortcut while there is nothing to save', async () => {
		const onsave = vi.fn();
		await render(Harness, { onsave, shortcut: 'ctrl+s' });
		name().focus();
		await userEvent.keyboard('{Control>}s{/Control}');
		expect(onsave).not.toHaveBeenCalled();
	});
});
