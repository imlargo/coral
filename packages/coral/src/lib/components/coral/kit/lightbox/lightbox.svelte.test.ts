/**
 * @coral/kit/lightbox
 * @version 1.0.0
 */

import { render } from 'vitest-browser-svelte';
import { userEvent } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import Harness from './lightbox-harness.test.svelte';

const pixel = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
const items = [
	{ src: pixel, alt: 'Dashboard, light theme' },
	{ src: pixel, alt: 'Dashboard, dark theme' },
	{ src: pixel, alt: 'Settings page' }
];

const dialog = () => document.querySelector<HTMLElement>('[role="dialog"]');
const thumbs = () => Array.from(document.querySelectorAll<HTMLButtonElement>('[data-thumb]'));
const announced = () => document.querySelector('span[role="status"]')?.textContent?.trim();
const button = (label: string) =>
	Array.from(document.querySelectorAll<HTMLButtonElement>('button')).find(
		(entry) => entry.getAttribute('aria-label') === label
	);

describe('opening', () => {
	it('opens on the item that was chosen and says where it is', async () => {
		const props = $state({ items, open: false, index: 0 });
		await render(Harness, props);

		await userEvent.click(thumbs()[1]);
		await expect.poll(dialog).not.toBeNull();
		expect(props.index).toBe(1);
		expect(dialog()?.getAttribute('aria-describedby')).toBeTruthy();
		expect(dialog()?.textContent).toContain('2 of 3');
	});

	it('returns focus to the thumbnail it came from when it closes', async () => {
		const props = $state({ items, open: false, index: 0 });
		await render(Harness, props);

		await userEvent.click(thumbs()[2]);
		await expect.poll(dialog).not.toBeNull();
		await userEvent.keyboard('{Escape}');
		await expect.poll(dialog).toBeNull();
		expect(document.activeElement).toBe(thumbs()[2]);
	});
});

describe('moving', () => {
	it('moves with the arrows from anywhere in the viewer, and announces the position', async () => {
		const onindexchange = vi.fn();
		const props = $state({ items, open: true, index: 0, onindexchange });
		await render(Harness, props);
		await expect.poll(dialog).not.toBeNull();

		dialog()!.focus();
		await userEvent.keyboard('{ArrowRight}');
		await expect.poll(() => props.index).toBe(1);
		expect(onindexchange).toHaveBeenCalledWith(1);
		await expect.poll(announced).toBe('2 of 3');

		await userEvent.keyboard('{End}');
		await expect.poll(() => props.index).toBe(2);
		await userEvent.keyboard('{ArrowLeft}');
		await expect.poll(() => props.index).toBe(1);
	});

	it('moves with the buttons, which stop at the ends', async () => {
		const props = $state({ items, open: true, index: 2 });
		await render(Harness, props);
		await expect.poll(() => button('Next')).toBeDefined();
		expect(button('Next')?.disabled).toBe(true);

		await userEvent.click(button('Previous')!);
		await expect.poll(() => props.index).toBe(1);
		await expect.poll(() => button('Next')?.disabled).toBe(false);
	});

	it('follows an index assigned from code, without reporting it', async () => {
		const onindexchange = vi.fn();
		const props = $state({ items, open: true, index: 0, onindexchange });
		await render(Harness, props);
		await expect.poll(dialog).not.toBeNull();

		props.index = 2;
		await expect.poll(() => dialog()?.textContent).toContain('3 of 3');
		expect(onindexchange).not.toHaveBeenCalled();
	});

	it('loads the pictures beside the current one ahead, and the rest lazily', async () => {
		const many = Array.from({ length: 5 }, (_, i) => ({ src: pixel, alt: `Shot ${i + 1}` }));
		const props = $state({ items: many, open: true, index: 1 });
		await render(Harness, props);
		await expect.poll(dialog).not.toBeNull();

		const loading = () =>
			Array.from(document.querySelectorAll<HTMLImageElement>('[role="dialog"] img')).map(
				(img) => img.loading
			);
		expect(loading()).toEqual(['eager', 'eager', 'eager', 'lazy', 'lazy']);
	});
});
