/**
 * @coral/kit/follow-scroll
 * @version 1.0.0
 */

import { render } from 'vitest-browser-svelte';
import { userEvent } from 'vitest/browser';
import { createRawSnippet } from 'svelte';
import { describe, expect, it, vi } from 'vitest';
import FollowScroll from './follow-scroll.svelte';
import type { FollowScrollProps } from './types.js';

/** Lines of a build log, as tall as the box so there is always something to scroll. */
const lines = (count: number) =>
	createRawSnippet(() => ({
		render: () =>
			`<div>${Array.from({ length: count }, (_, i) => `<p style="height: 40px">line ${i + 1}</p>`).join('')}</div>`
	}));

const viewport = () => document.querySelector<HTMLElement>('[class*="overflow-y-auto"]')!;
const atEnd = (node: HTMLElement) => node.scrollHeight - node.clientHeight - node.scrollTop;

/** Scrolls, and lets the component's handler run. */
async function scrollTo(node: HTMLElement, top: number) {
	node.scrollTop = top;
	node.dispatchEvent(new Event('scroll'));
	await new Promise((resolve) => requestAnimationFrame(() => resolve(null)));
}

/** Waits for the resize observer to report the content it just grew. */
const settle = () => new Promise((resolve) => setTimeout(resolve, 60));

const props = (extra: Partial<FollowScrollProps> = {}): FollowScrollProps => ({
	class: 'h-40',
	children: lines(10),
	// Present so the bindings have somewhere to write back to.
	pinned: true,
	count: undefined,
	...extra
});

describe('following', () => {
	it('starts at the end', async () => {
		await render(FollowScroll, props());
		await settle();
		expect(atEnd(viewport())).toBeLessThanOrEqual(1);
	});

	it('starts at the top when it starts unpinned', async () => {
		await render(FollowScroll, props({ pinned: false, children: lines(30) }));
		await settle();
		expect(viewport().scrollTop).toBe(0);
	});

	it('stays at the end as content arrives', async () => {
		const view = $state(props({ children: lines(10) }));
		await render(FollowScroll, view);
		await settle();

		view.children = lines(30);
		await settle();
		expect(atEnd(viewport())).toBeLessThanOrEqual(1);
	});

	it('stops following once the reader scrolls back', async () => {
		const view = $state(props({ children: lines(30), pinned: true }));
		await render(FollowScroll, view);
		await settle();

		await scrollTo(viewport(), 100);
		expect(view.pinned).toBe(false);

		const held = viewport().scrollTop;
		view.children = lines(60);
		await settle();
		// The content grew and the view did not move under the reader.
		expect(viewport().scrollTop).toBe(held);
	});

	it('follows again once they scroll back to the end', async () => {
		const view = $state(props({ children: lines(30), pinned: true }));
		await render(FollowScroll, view);
		await settle();

		await scrollTo(viewport(), 100);
		expect(view.pinned).toBe(false);

		const node = viewport();
		await scrollTo(node, node.scrollHeight - node.clientHeight);
		expect(view.pinned).toBe(true);
	});

	it('reports the change, and only on a change', async () => {
		const onpinnedchange = vi.fn();
		await render(FollowScroll, props({ children: lines(30), onpinnedchange }));
		await settle();

		await scrollTo(viewport(), 100);
		await scrollTo(viewport(), 90);
		expect(onpinnedchange).toHaveBeenCalledExactlyOnceWith(false);
	});
});

describe('catching up', () => {
	it('offers a way back once content arrives behind the reader', async () => {
		const view = $state(props({ children: lines(30) }));
		await render(FollowScroll, view);
		await settle();
		await scrollTo(viewport(), 100);

		expect(document.querySelector('button')).toBeNull();

		view.children = lines(60);
		await settle();
		expect(document.querySelector('button')).not.toBeNull();
	});

	it('counts what arrived since the reader looked away', async () => {
		const view = $state(props({ children: lines(30), count: 30 }));
		await render(FollowScroll, view);
		await settle();
		await scrollTo(viewport(), 100);

		view.children = lines(34);
		view.count = 34;
		await settle();
		expect(document.querySelector('button')?.textContent).toContain('4 new');
	});

	it('goes back to the end and follows again', async () => {
		const view = $state(props({ children: lines(30) }));
		await render(FollowScroll, view);
		await settle();
		await scrollTo(viewport(), 100);
		view.children = lines(60);
		await settle();

		await userEvent.click(document.querySelector('button')!);
		await settle();

		expect(view.pinned).toBe(true);
		expect(atEnd(viewport())).toBeLessThanOrEqual(1);
		expect(document.querySelector('button')).toBeNull();
	});

	it('says nothing while the reader is at the end', async () => {
		const view = $state(props({ children: lines(30), count: 30 }));
		await render(FollowScroll, view);
		await settle();

		view.children = lines(40);
		view.count = 40;
		await settle();
		expect(document.querySelector('button')).toBeNull();
	});
});
