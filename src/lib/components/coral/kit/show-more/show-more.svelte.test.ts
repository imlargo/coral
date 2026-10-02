/**
 * @coral/kit/show-more
 * @version 1.0.0
 */

import { render } from 'vitest-browser-svelte';
import { createRawSnippet } from 'svelte';
import { userEvent } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import ShowMore from './show-more.svelte';

/** Ten lines, the last of which holds a link - clipped away while collapsed. */
const long = createRawSnippet(() => ({
	render: () =>
		`<div>${Array.from({ length: 10 }, (_, index) => `<p>Line ${index + 1}</p>`).join('')}<a href="#end" id="last-link">End</a></div>`
}));
const short = createRawSnippet(() => ({ render: () => '<div><p>Just one line.</p></div>' }));

/** A fixed line height, so `lines` means a number of pixels the tests can rely on. */
const base = { lines: 3, style: 'line-height: 20px' };

const toggle = () => document.querySelector<HTMLButtonElement>('button[aria-expanded]');
const region = () => document.querySelector<HTMLElement>('[id$="-content"]')!;

describe('overflowing', () => {
	it('offers to expand content that does not fit', async () => {
		await render(ShowMore, { ...base, children: long });
		await expect.poll(() => toggle()?.textContent?.trim()).toBe('Show more');
		expect(region().getBoundingClientRect().height).toBeCloseTo(60, 0);
	});

	it('offers nothing for content that already fits', async () => {
		await render(ShowMore, { ...base, children: short });
		await new Promise((resolve) => setTimeout(resolve, 60));
		expect(toggle()).toBeNull();
	});
});

describe('toggling', () => {
	it('expands, says so on the button, and reports it', async () => {
		const onexpandedchange = vi.fn();
		const props = $state({ ...base, children: long, expanded: false, onexpandedchange });
		await render(ShowMore, props);
		await expect.poll(toggle).not.toBeNull();

		await userEvent.click(toggle()!);
		expect(props.expanded).toBe(true);
		expect(onexpandedchange).toHaveBeenCalledWith(true);
		expect(toggle()?.getAttribute('aria-expanded')).toBe('true');
		expect(toggle()?.textContent?.trim()).toBe('Show less');
		expect(region().getBoundingClientRect().height).toBeGreaterThan(150);
	});

	it('collapses again, and keeps offering to expand', async () => {
		const props = $state({ ...base, children: long, expanded: true });
		await render(ShowMore, props);

		await userEvent.click(toggle()!);
		expect(props.expanded).toBe(false);
		await expect.poll(() => toggle()?.textContent?.trim()).toBe('Show more');
	});

	it('keeps offering to collapse once expanded, even though nothing overflows any more', async () => {
		await render(ShowMore, { ...base, children: long, expanded: true });
		expect(toggle()?.textContent?.trim()).toBe('Show less');
	});

	it('does not call onexpandedchange for a change made from code', async () => {
		const onexpandedchange = vi.fn();
		const props = $state({ ...base, children: long, expanded: false, onexpandedchange });
		await render(ShowMore, props);

		props.expanded = true;
		await expect.poll(() => toggle()?.getAttribute('aria-expanded')).toBe('true');
		expect(onexpandedchange).not.toHaveBeenCalled();
	});

	it('points the toggle at the region it controls', async () => {
		await render(ShowMore, { ...base, children: long });
		await expect.poll(toggle).not.toBeNull();
		expect(toggle()?.getAttribute('aria-controls')).toBe(region().id);
	});

	it('takes the labels as props', async () => {
		await render(ShowMore, { ...base, children: long, moreLabel: 'Mehr', lessLabel: 'Weniger' });
		await expect.poll(() => toggle()?.textContent?.trim()).toBe('Mehr');
	});
});

describe('the keyboard', () => {
	it('expands when focus lands somewhere that is clipped away', async () => {
		const props = $state({ ...base, children: long, expanded: false });
		await render(ShowMore, props);
		await expect.poll(toggle).not.toBeNull();

		document.getElementById('last-link')!.focus();
		await expect.poll(() => props.expanded).toBe(true);
	});

	it('leaves a link that is in view alone', async () => {
		const first = createRawSnippet(() => ({
			render: () =>
				'<div><a href="#top" id="first-link">Top</a><p>a</p><p>b</p><p>c</p><p>d</p><p>e</p></div>'
		}));
		const props = $state({ ...base, children: first, expanded: false });
		await render(ShowMore, props);
		await expect.poll(toggle).not.toBeNull();

		document.getElementById('first-link')!.focus();
		await new Promise((resolve) => setTimeout(resolve, 30));
		expect(props.expanded).toBe(false);
	});
});

describe('a toggle of your own', () => {
	it('gets the props to spread, and is only there when there is something to reveal', async () => {
		const own = createRawSnippet<[{ props: Record<string, unknown> }]>(() => ({
			render: () => '<button data-own>More text</button>'
		}));
		await render(ShowMore, { ...base, children: long, toggle: own });
		await expect.poll(() => document.querySelector('[data-own]')).not.toBeNull();
	});

	it('is not rendered for content that fits', async () => {
		const own = createRawSnippet<[{ props: Record<string, unknown> }]>(() => ({
			render: () => '<button data-own>More text</button>'
		}));
		await render(ShowMore, { ...base, children: short, toggle: own });
		await new Promise((resolve) => setTimeout(resolve, 60));
		expect(document.querySelector('[data-own]')).toBeNull();
	});
});
