/**
 * @coral/kit/timeline
 * @version 1.0.0
 */

import { render } from 'vitest-browser-svelte';
import { createRawSnippet } from 'svelte';
import { userEvent } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import Timeline from './timeline.svelte';
import type { TimelineItemContext } from './types.js';

type Event = { id: string; at: string; text: string };

const NOW = new Date('2026-10-24T15:00:00Z');
const events: Event[] = [
	{ id: 'a', at: '2026-10-24T13:05:00Z', text: 'Deployed to production' },
	{ id: 'b', at: '2026-10-24T09:00:00Z', text: 'Build passed' },
	{ id: 'c', at: '2026-10-23T18:30:00Z', text: 'Opened pull request' },
	{ id: 'd', at: '2026-10-20T08:00:00Z', text: 'Project created' }
];

const item = createRawSnippet<[TimelineItemContext<Event>]>((context) => ({
	render: () => `<span>${context().item.text}</span>`
}));

/** `render` cannot infer a generic component's parameters, and lands on `unknown`. */
const draw = (props: Record<string, unknown>) => render(Timeline, props as never);

const headings = () =>
	Array.from(document.querySelectorAll('h2, h3, h4')).map((h) => h.textContent?.trim());
const rows = () => Array.from(document.querySelectorAll('li')).map((li) => li.textContent?.trim());

describe('grouping', () => {
	it('groups the events by calendar day, in the order given, with a heading per day', async () => {
		await draw({ items: events, getDate: (e: Event) => e.at, item, now: NOW, timeZone: 'UTC' });
		expect(headings()).toEqual(['Today', 'Yesterday', 'October 20, 2026']);
		expect(document.querySelectorAll('ol')).toHaveLength(3);
		expect(rows()[0]).toContain('Deployed to production');
	});

	it('cuts the days where the reader is, not where UTC is', async () => {
		// 03:00 UTC on the 24th is still the evening of the 23rd in Bogotá.
		const evening: Event[] = [{ id: 'e', at: '2026-10-24T03:00:00Z', text: 'Late commit' }];
		await draw({
			items: evening,
			getDate: (e: Event) => e.at,
			item,
			now: NOW,
			timeZone: 'America/Bogota'
		});
		expect(headings()).toEqual(['Yesterday']);
	});

	it('words the headings in the locale, and takes the heading level it is told', async () => {
		await draw({
			items: events.slice(0, 1),
			getDate: (e: Event) => e.at,
			item,
			now: NOW,
			timeZone: 'UTC',
			locale: 'es-CO',
			headingLevel: 2
		});
		expect(document.querySelector('h2')?.textContent?.trim()).toBe('Hoy');
	});
});

describe('each event', () => {
	it("carries its instant in a <time>, printed as the reader's clock", async () => {
		await draw({
			items: events.slice(0, 1),
			getDate: (e: Event) => e.at,
			item,
			now: NOW,
			timeZone: 'UTC'
		});
		const time = document.querySelector('time')!;
		expect(time.getAttribute('datetime')).toBe('2026-10-24T13:05:00.000Z');
		expect(time.textContent?.trim()).toMatch(/1:05/);
	});
});

describe('loading older', () => {
	it('appends below, keeps the control, and says how many arrived', async () => {
		const props = $state({
			items: events.slice(0, 2) as Event[],
			getDate: (e: Event) => e.at,
			item,
			now: NOW,
			timeZone: 'UTC',
			hasMore: true,
			loadMoreLabel: 'Show older',
			onloadmore: vi.fn(async () => {
				await new Promise((resolve) => setTimeout(resolve, 20));
				props.items = [...props.items, ...events.slice(2)];
			})
		});
		await draw(props);

		const button = Array.from(document.querySelectorAll('button')).find(
			(entry) => entry.textContent?.trim() === 'Show older'
		)!;
		await userEvent.click(button);
		await expect.poll(() => rows().length).toBe(4);
		expect(document.activeElement).toBe(button);
		// The button has a status region of its own for its wait; the count lands in the timeline's.
		const announced = () =>
			Array.from(document.querySelectorAll('span[role="status"]')).map((region) =>
				region.textContent?.trim()
			);
		await expect.poll(announced).toContain('2 older loaded');
	});

	it('shows the empty state only when there is nothing and nothing more to load', async () => {
		const props = $state({
			items: [] as Event[],
			getDate: (e: Event) => e.at,
			item,
			hasMore: true,
			emptyMessage: 'No activity yet.'
		});
		await draw(props);
		expect(document.body.textContent).not.toContain('No activity yet.');

		props.hasMore = false;
		await expect.poll(() => document.body.textContent).toContain('No activity yet.');
	});
});
