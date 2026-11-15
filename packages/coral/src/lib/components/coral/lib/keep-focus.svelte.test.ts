/**
 * @coral/lib/keep-focus
 * @version 1.0.0
 */

import { render } from 'vitest-browser-svelte';
import { describe, expect, it } from 'vitest';
import Harness from './keep-focus-harness.test.svelte';

const button = (text: string) =>
	Array.from(document.querySelectorAll('button')).find(
		(entry) => entry.textContent?.trim() === text
	)!;
const field = () => document.querySelector('input')!;

describe('keepFocus', () => {
	it('stays on the row when the focused control in it is swapped for another', async () => {
		const props = $state({ items: [{ id: 'a', done: false }] });
		await render(Harness, props);

		button('Cancel a').focus();
		props.items = [{ id: 'a', done: true }];
		await expect.poll(() => document.activeElement).toBe(button('Remove a'));
	});

	it('moves to the row that took the removed one’s place, or the one before at the end', async () => {
		const props = $state({
			items: [
				{ id: 'a', done: true },
				{ id: 'b', done: true },
				{ id: 'c', done: true }
			]
		});
		await render(Harness, props);

		button('Remove b').focus();
		props.items = props.items.filter((item) => item.id !== 'b');
		await expect.poll(() => document.activeElement).toBe(button('Remove c'));

		props.items = props.items.filter((item) => item.id !== 'c');
		await expect.poll(() => document.activeElement).toBe(button('Remove a'));
	});

	it('falls back once the list is gone', async () => {
		const props = $state({ items: [{ id: 'a', done: true }] });
		await render(Harness, props);

		button('Remove a').focus();
		props.items = [];
		await expect.poll(() => document.activeElement).toBe(field());
	});

	it('leaves alone a reader who went somewhere else', async () => {
		const props = $state({
			items: [
				{ id: 'a', done: true },
				{ id: 'b', done: true }
			]
		});
		await render(Harness, props);

		button('Remove a').focus();
		button('Outside').focus();
		props.items = props.items.slice(1);
		await new Promise((resolve) => setTimeout(resolve, 30));
		expect(document.activeElement).toBe(button('Outside'));
	});

	it('lets go of focus the reader dropped on empty space', async () => {
		const props = $state({
			items: [
				{ id: 'a', done: true },
				{ id: 'b', done: true }
			]
		});
		await render(Harness, props);

		button('Remove a').focus();
		button('Remove a').blur();
		await new Promise((resolve) => setTimeout(resolve, 0));
		props.items = props.items.slice(1);
		await new Promise((resolve) => setTimeout(resolve, 30));
		expect(document.activeElement).toBe(document.body);
	});
});
