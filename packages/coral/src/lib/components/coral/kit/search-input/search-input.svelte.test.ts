/**
 * @coral/kit/search-input
 * @version 1.0.0
 */

import { render } from 'vitest-browser-svelte';
import { userEvent } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import SearchInput from './search-input.svelte';

function field(): HTMLInputElement {
	const found = document.querySelector<HTMLInputElement>('input[type="search"]');
	if (!found) throw new Error('no search field');
	return found;
}

describe('reporting', () => {
	it('reports the finished term once, not every keystroke', async () => {
		const onsearch = vi.fn();
		// The debounce has to outlast the gap between two simulated keystrokes, or the test is a
		// race: at 50ms a loaded machine types slowly enough to report `ki` before `kiwi`.
		await render(SearchInput, { onsearch, debounce: 300, 'aria-label': 'Search' });

		await userEvent.type(field(), 'kiwi');
		await expect.poll(() => onsearch.mock.calls).toEqual([['kiwi']]);
	});

	it('reports straight away on Enter', async () => {
		const onsearch = vi.fn();
		await render(SearchInput, { onsearch, debounce: 10_000, 'aria-label': 'Search' });

		await userEvent.type(field(), 'açaí{Enter}');
		expect(onsearch).toHaveBeenCalledWith('açaí');
	});

	it('does not repeat a term that only gained a trailing space', async () => {
		const onsearch = vi.fn();
		await render(SearchInput, { onsearch, debounce: 0, 'aria-label': 'Search' });

		await userEvent.type(field(), 'kiwi ');
		expect(onsearch.mock.calls.map(([term]) => term)).toEqual(['k', 'ki', 'kiw', 'kiwi']);
	});
});

describe('Escape', () => {
	it('clears the field, reports the empty search, and stops there', async () => {
		const onsearch = vi.fn();
		const outside = vi.fn();
		await render(SearchInput, { onsearch, debounce: 0, 'aria-label': 'Search' });
		document.addEventListener('keydown', outside);

		await userEvent.type(field(), 'mango');
		await userEvent.keyboard('{Escape}');

		expect(field().value).toBe('');
		expect(onsearch).toHaveBeenLastCalledWith('');
		expect(outside).not.toHaveBeenCalledWith(expect.objectContaining({ key: 'Escape' }));

		// With nothing left to clear, the next Escape is left for whatever is around the field.
		await userEvent.keyboard('{Escape}');
		expect(outside).toHaveBeenCalledWith(expect.objectContaining({ key: 'Escape' }));
		document.removeEventListener('keydown', outside);
	});
});
