/**
 * @coral/kit/breadcrumbs
 * @version 1.0.0
 */

import { render } from 'vitest-browser-svelte';
import { userEvent } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import Breadcrumbs from './breadcrumbs.svelte';
import type { Crumb } from './types.js';

const trail: Crumb[] = [
	{ label: 'Projects', href: '/projects' },
	{ label: 'api-gateway', href: '/projects/api-gateway' },
	{ label: 'Deployments', href: '/projects/api-gateway/deployments' },
	{ label: 'Production', href: '/projects/api-gateway/deployments/production' },
	{ label: 'dpl_8f3a2c' }
];

const visible = () =>
	Array.from(
		document.querySelectorAll('nav[aria-label="breadcrumb"] > ol [data-slot="breadcrumb-item"]')
	).map((item) => item.textContent?.trim());
const fold = () => document.querySelector<HTMLButtonElement>('nav button[aria-label]');

describe('fitting', () => {
	it('shows the whole trail where there is room', async () => {
		await render(Breadcrumbs, { items: trail, class: 'w-[800px]' });
		await expect
			.poll(visible)
			.toEqual(['Projects', 'api-gateway', 'Deployments', 'Production', 'dpl_8f3a2c']);
		expect(fold()).toBeNull();
	});

	it('folds the middle into a menu when the trail does not fit, keeping both ends', async () => {
		await render(Breadcrumbs, { items: trail, class: 'w-[260px]' });
		await expect.poll(() => fold()).not.toBeNull();
		const shown = visible();
		expect(shown[0]).toBe('Projects');
		expect(shown.at(-1)).toBe('dpl_8f3a2c');
		expect(shown.length).toBeLessThan(trail.length);
	});

	it('lists the folded pages, in full and in order, when the fold is opened', async () => {
		await render(Breadcrumbs, { items: trail, class: 'w-[200px]', foldedLabel: 'More pages' });
		await expect.poll(() => fold()).not.toBeNull();
		expect(fold()?.getAttribute('aria-label')).toBe('More pages');

		await userEvent.click(fold()!);
		const links = () =>
			Array.from(document.querySelectorAll<HTMLAnchorElement>('[role="menuitem"]')).map((a) => [
				a.textContent?.trim(),
				a.getAttribute('href')
			]);
		await expect.poll(() => links().length).toBeGreaterThan(0);
		expect(links()[0]).toEqual(['api-gateway', '/projects/api-gateway']);
	});

	it('unfolds again when room comes back', async () => {
		const props = $state({ items: trail, class: 'w-[200px]' });
		await render(Breadcrumbs, props);
		await expect.poll(() => fold()).not.toBeNull();

		props.class = 'w-[800px]';
		await expect.poll(() => fold()).toBeNull();
	});
});

describe('marking the page', () => {
	it('marks the last crumb as the current page, and does not link it', async () => {
		await render(Breadcrumbs, { items: trail, class: 'w-[800px]' });
		const page = document.querySelector('[aria-current="page"]');
		expect(page?.textContent?.trim()).toBe('dpl_8f3a2c');
		expect(page?.tagName).not.toBe('A');
		expect(document.querySelectorAll('nav a').length).toBe(4);
	});

	it('keeps a long name readable in full through its title', async () => {
		await render(Breadcrumbs, {
			items: [{ label: 'Projects', href: '/p' }, { label: 'a-very-long-repository-name-indeed' }],
			class: 'w-[160px]'
		});
		const page = document.querySelector<HTMLElement>('[aria-current="page"]')!;
		expect(page.title).toBe('a-very-long-repository-name-indeed');
		expect(page.scrollWidth).toBeGreaterThan(page.clientWidth);
	});
});
