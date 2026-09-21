/**
 * @coral/kit/action-button
 * @version 1.0.0
 */

import { render } from 'vitest-browser-svelte';
import { userEvent } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import ActionButton from './action-button.svelte';

const button = () => document.querySelector<HTMLButtonElement>('button')!;

describe('pending', () => {
	it('runs once however many times it is clicked while waiting', async () => {
		let release!: () => void;
		const onclick = vi.fn(() => new Promise<void>((resolve) => (release = resolve)));
		await render(ActionButton, { onclick });

		await userEvent.click(button());
		// Dispatched directly: Playwright's own click waits for an `aria-disabled` button to become
		// enabled, which is the very click this test needs to land while it is busy.
		button().click();
		button().click();
		expect(onclick).toHaveBeenCalledOnce();

		release();
		await expect.poll(() => button().getAttribute('aria-busy')).toBeNull();
	});

	it('keeps focus on the button while busy', async () => {
		const onclick = () => new Promise<void>(() => {});
		await render(ActionButton, { onclick });

		button().focus();
		await userEvent.keyboard('{Enter}');

		await expect.poll(() => button().getAttribute('aria-busy')).toBe('true');
		expect(button().disabled).toBe(false);
		expect(document.activeElement).toBe(button());
	});

	it('skips onsuccess when the action returns false, and hands a throw to onerror', async () => {
		const onsuccess = vi.fn();
		const onerror = vi.fn();
		const failure = new Error('offline');

		const { rerender } = await render(ActionButton, { onclick: () => false, onsuccess, onerror });
		await userEvent.click(button());
		expect(onsuccess).not.toHaveBeenCalled();

		await rerender({
			onclick: () => {
				throw failure;
			}
		});
		await userEvent.click(button());
		await expect.poll(() => onerror.mock.calls).toEqual([[failure]]);
	});
});
