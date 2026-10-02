/**
 * @coral/kit/avatar
 * @version 1.0.0
 */

import { render } from 'vitest-browser-svelte';
import { createRawSnippet } from 'svelte';
import { describe, expect, it } from 'vitest';
import Avatar from './avatar.svelte';

const root = () => document.querySelector<HTMLElement>('[data-slot="avatar"]')!;
const fallback = () => document.querySelector<HTMLElement>('[data-slot="avatar-fallback"]');
const image = () => document.querySelector<HTMLImageElement>('img');
/** What a screen reader would read out for the avatar. */
const spoken = () =>
	Array.from(root().querySelectorAll('.sr-only')).map((entry) => entry.textContent?.trim());
const drawn = () => root().querySelector('[aria-hidden="true"]')?.textContent?.trim();

/** An address nothing listens on, so the browser reports the image as broken. */
const BROKEN = 'http://127.0.0.1:1/missing.png';

describe('the fallback', () => {
	it('draws the initials of the name when there is no image', async () => {
		await render(Avatar, { name: 'Amara Diallo' });
		expect(drawn()).toBe('AD');
	});

	it('takes the first and the last word, so a particle in the middle is left out', async () => {
		await render(Avatar, { name: 'Elena van der Meer' });
		expect(drawn()).toBe('EM');
	});

	it('takes fallback text over the initials', async () => {
		await render(Avatar, { name: 'Amara Diallo', fallback: '?' });
		expect(drawn()).toBe('?');
	});

	it('takes a snippet for the fallback', async () => {
		const custom = createRawSnippet(() => ({ render: () => '<i data-custom>★</i>' }));
		await render(Avatar, { name: 'Amara Diallo', fallback: custom });
		expect(root().querySelector('[data-custom]')).not.toBeNull();
	});

	it('takes over when the image cannot load', async () => {
		await render(Avatar, { name: 'Amara Diallo', src: BROKEN });
		await expect.poll(fallback).not.toBeNull();
		expect(drawn()).toBe('AD');
	});
});

describe('the name', () => {
	it('says the person, not the letters, and says it once', async () => {
		await render(Avatar, { name: 'Amara Diallo' });
		expect(spoken()).toEqual(['Amara Diallo']);
		expect(root().querySelector('[aria-hidden="true"]')).not.toBeNull();
	});

	it('does not change when the photo fails to load', async () => {
		await render(Avatar, { name: 'Amara Diallo', src: BROKEN });
		await expect.poll(fallback).not.toBeNull();
		expect(spoken()).toEqual(['Amara Diallo']);
	});

	it('names the image the same way while it is showing', async () => {
		await render(Avatar, {
			name: 'Amara Diallo',
			src: 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'
		});
		await expect.poll(image).not.toBeNull();
		expect(image()?.alt).toBe('Amara Diallo');
	});

	it('takes an alt of its own over the name, and an empty one to mean decorative', async () => {
		await render(Avatar, { name: 'Amara Diallo', alt: 'Amara at the offsite' });
		expect(spoken()).toEqual(['Amara at the offsite']);
	});

	it('draws a decorative avatar with nothing to announce', async () => {
		await render(Avatar, { name: 'Amara Diallo', alt: '' });
		expect(spoken()).toEqual([]);
		expect(root().querySelector('[aria-hidden="true"]')?.textContent?.trim()).toBe('AD');
	});

	it('leaves the initials readable when there is no name to work from and text was supplied', async () => {
		await render(Avatar, { fallback: 'JD' });
		expect(root().querySelector('[aria-hidden="true"]')).toBeNull();
		expect(root().textContent?.trim()).toBe('JD');
	});
});

describe('the root', () => {
	it('forwards what the primitive takes', async () => {
		await render(Avatar, { name: 'Amara Diallo', class: 'custom', 'data-testid': 'a' });
		expect(root().classList.contains('custom')).toBe(true);
		expect(root().dataset.testid).toBe('a');
	});
});
