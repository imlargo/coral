/**
 * @coral/kit/avatar-stack
 * @version 1.0.0
 */

import { render } from 'vitest-browser-svelte';
import { createRawSnippet } from 'svelte';
import type { ComponentProps } from 'svelte';
import { describe, expect, it } from 'vitest';
import AvatarStack from './avatar-stack.svelte';

const people = [
	{ name: 'Amara Diallo' },
	{ name: 'Wei Zhang' },
	{ name: 'Sofia Rossi' },
	{ name: "Liam O'Connor" },
	{ name: 'Priya Sharma' }
];

const draw = (props: Record<string, unknown>) =>
	render(AvatarStack, props as unknown as ComponentProps<typeof AvatarStack>);

const list = () => document.querySelector<HTMLElement>('[role="list"]')!;
const items = () => Array.from(list().querySelectorAll('[role="listitem"]'));
const count = () => items().find((entry) => entry.getAttribute('aria-label') !== null);
const avatars = () => items().filter((entry) => entry.getAttribute('aria-label') === null);

describe('the list', () => {
	it('reads as a list, named as a whole', async () => {
		await draw({ items: people, label: 'Viewing this document' });
		expect(list().getAttribute('aria-label')).toBe('Viewing this document');
		expect(items()).toHaveLength(5);
	});

	it('draws everyone when there is no maximum', async () => {
		await draw({ items: people });
		expect(avatars()).toHaveLength(5);
		expect(count()).toBeUndefined();
	});
});

describe('the maximum', () => {
	it('counts the count as one of the circles', async () => {
		await draw({ items: people, max: 3 });
		expect(avatars()).toHaveLength(2);
		expect(count()?.textContent?.trim()).toBe('+3');
	});

	it('draws everyone when they all fit', async () => {
		await draw({ items: people.slice(0, 3), max: 3 });
		expect(avatars()).toHaveLength(3);
		expect(count()).toBeUndefined();
	});

	it('never draws a count of one: the person is drawn instead', async () => {
		await draw({ items: people.slice(0, 4), max: 4 });
		expect(avatars()).toHaveLength(4);
		expect(count()).toBeUndefined();
	});

	it('reads a maximum below one as one', async () => {
		await draw({ items: people, max: 0 });
		expect(items()).toHaveLength(1);
		expect(count()?.textContent?.trim()).toBe('+5');
	});
});

describe('the count', () => {
	it('names itself for a screen reader, and hides the digits', async () => {
		await draw({ items: people, max: 3 });
		expect(count()?.getAttribute('aria-label')).toBe('3 more');
		expect(count()?.querySelector('[aria-hidden="true"]')?.textContent).toBe('+3');
	});

	it('lists the people it stands for on hover', async () => {
		await draw({ items: people, max: 3 });
		expect(count()?.getAttribute('title')).toBe("Sofia Rossi, Liam O'Connor, Priya Sharma");
	});

	it('takes the wording from a function', async () => {
		await draw({ items: people, max: 3, overflowLabel: (hidden: number) => `${hidden} others` });
		expect(count()?.getAttribute('aria-label')).toBe('3 others');
	});

	it('hands what is hidden to a snippet of its own', async () => {
		const overflow = createRawSnippet<[{ count: number; label: string }]>((context) => ({
			render: () =>
				`<span role="listitem" aria-label="${context().label}" data-own>${context().count}</span>`
		}));
		await draw({ items: people, max: 4, overflow });
		expect(document.querySelector('[data-own]')?.textContent).toBe('2');
	});
});

describe('the people', () => {
	it('reads them through getPerson, so any item shape will do', async () => {
		await draw({
			items: [{ user: { full: 'Kenji Tanaka' } }, { user: { full: 'Lucas Andersen' } }],
			getPerson: (item: { user: { full: string } }) => ({ name: item.user.full })
		});
		expect(list().textContent).toContain('Kenji Tanaka');
		expect(list().textContent).toContain('Lucas Andersen');
	});

	it('names each avatar after its person, once', async () => {
		await draw({ items: people.slice(0, 2) });
		expect(avatars().map((entry) => entry.textContent?.replace(/\s+/g, ' ').trim())).toEqual([
			'AD Amara Diallo',
			'WZ Wei Zhang'
		]);
	});
});
