/**
 * @coral/kit/page-state
 * @version 1.0.1
 */

import { render } from 'vitest-browser-svelte';
import { userEvent } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { createRawSnippet } from 'svelte';
import PageState from './page-state.svelte';
import type { PageStateProps } from './types.js';

/** Stands in for whatever the screen actually shows once it has something to show. */
const content = createRawSnippet(() => ({ render: () => '<p>Deploys</p>' }));

/** Short windows, so the tests measure the rule rather than sit through the real one. */
const timing = { delay: 50, minimum: 150 };

const root = () => document.querySelector('[data-state]')!;
const shown = () => root().getAttribute('data-state');
const text = () => document.body.textContent ?? '';

const props = (extra: Partial<PageStateProps> = {}): PageStateProps => ({
	...timing,
	children: content,
	...extra
});

describe('waiting', () => {
	it('draws nothing at all for a request that finishes quickly', async () => {
		const view = $state(props({ loading: true }));
		await render(PageState, view);

		// Inside the delay window: the content it already had stays put.
		expect(shown()).toBe('idle');
		expect(text()).toContain('Deploys');

		view.loading = false;
		await new Promise((resolve) => setTimeout(resolve, 120));
		expect(shown()).toBe('content');
	});

	it('shows the wait once it has lasted long enough', async () => {
		await render(PageState, props({ loading: true }));
		await expect.poll(shown, { timeout: 500 }).toBe('loading');
	});

	it('keeps the indicator up for the minimum, so it cannot blink', async () => {
		// Its own window: the minimum is measured from the moment the indicator appeared, and polling
		// for that moment costs time out of it.
		const view = $state(props({ loading: true, delay: 20, minimum: 600 }));
		await render(PageState, view);
		await expect.poll(shown, { timeout: 500 }).toBe('loading');

		// The data lands right after the indicator did.
		view.loading = false;
		await new Promise((resolve) => setTimeout(resolve, 150));
		expect(shown()).toBe('loading');

		await expect.poll(shown, { timeout: 1000 }).toBe('content');
	});
});

describe('which state wins', () => {
	it('keeps an error through a reload', async () => {
		await render(PageState, props({ loading: true, error: new Error('offline') }));
		expect(shown()).toBe('error');
		await new Promise((resolve) => setTimeout(resolve, 120));
		expect(shown()).toBe('error');
	});

	it('shows the empty state only when nothing is loading or broken', async () => {
		const view = $state(props({ empty: true, loading: true }));
		await render(PageState, view);
		await expect.poll(shown, { timeout: 500 }).toBe('loading');

		view.loading = false;
		await expect.poll(shown, { timeout: 500 }).toBe('empty');
		expect(text()).toContain('Nothing here yet.');
	});

	it('reports the state it is in', async () => {
		const view = $state(props({ empty: true, status: 'idle' }));
		await render(PageState, view);
		await expect.poll(() => view.status).toBe('empty');
	});
});

describe('retrying', () => {
	it('offers a retry only when there is something to retry', async () => {
		await render(PageState, props({ error: 'offline' }));
		expect(document.querySelector('button')).toBeNull();
	});

	it('runs the retry, and blocks a second press while it is out', async () => {
		let release!: () => void;
		const onretry = vi.fn(() => new Promise<void>((resolve) => (release = resolve)));
		await render(PageState, props({ error: 'offline', onretry }));

		const button = document.querySelector('button')!;
		await userEvent.click(button);
		button.click();
		expect(onretry).toHaveBeenCalledOnce();
		expect(button.getAttribute('aria-busy')).toBe('true');

		release();
		await expect.poll(() => button.getAttribute('aria-busy')).toBeNull();
	});
});

describe('marking the region', () => {
	it('is busy while loading, whether or not the indicator shows yet', async () => {
		await render(PageState, props({ loading: true }));
		expect(root().getAttribute('aria-busy')).toBe('true');
		expect(shown()).toBe('idle');
	});
});
