/**
 * @coral/kit/reorder-list
 * @version 1.0.0
 */

import { render } from 'vitest-browser-svelte';
import { userEvent } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import ReorderList from './reorder-list.svelte';

const labels = () =>
	Array.from(document.querySelectorAll('[data-coral-row]')).map((row) => row.textContent?.trim());
const handle = (index: number) =>
	document.querySelector<HTMLElement>(`[data-coral-handle="${index}"]`)!;
const announced = () => document.querySelector('[role="status"]')?.textContent;

describe('keyboard', () => {
	it('picks up, moves and drops, reporting once', async () => {
		const onreorder = vi.fn();
		await render(ReorderList, { items: ['a', 'b', 'c'], onreorder });

		handle(0).focus();
		await userEvent.keyboard(' ');
		expect(announced()).toContain('Position 1 of 3');

		await userEvent.keyboard('{ArrowDown}{ArrowDown}');
		expect(labels()).toEqual(['b', 'c', 'a']);
		expect(onreorder).not.toHaveBeenCalled();
		// Focus followed the row it moved.
		expect(document.activeElement).toBe(handle(2));

		await userEvent.keyboard(' ');
		expect(onreorder).toHaveBeenCalledOnce();
		expect(onreorder).toHaveBeenCalledWith(['b', 'c', 'a'], { item: 'a', from: 0, to: 2 });
	});

	it('puts everything back on Escape', async () => {
		const onreorder = vi.fn();
		await render(ReorderList, { items: ['a', 'b', 'c'], onreorder });

		handle(0).focus();
		await userEvent.keyboard(' {ArrowDown}{Escape}');

		expect(labels()).toEqual(['a', 'b', 'c']);
		expect(onreorder).not.toHaveBeenCalled();
		expect(document.activeElement).toBe(handle(0));
	});

	it('reports nothing for a drop back where it started', async () => {
		const onreorder = vi.fn();
		await render(ReorderList, { items: ['a', 'b', 'c'], onreorder });

		handle(1).focus();
		await userEvent.keyboard(' {ArrowDown}{ArrowUp} ');
		expect(onreorder).not.toHaveBeenCalled();
	});
});
