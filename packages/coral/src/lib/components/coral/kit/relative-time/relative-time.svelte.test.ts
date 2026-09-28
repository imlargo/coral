/**
 * @coral/kit/relative-time
 * @version 1.0.0
 */

import { render } from 'vitest-browser-svelte';
import { afterEach, describe, expect, it, vi } from 'vitest';
import RelativeTime from './relative-time.svelte';

const time = () => document.querySelector('time')!;
const now = new Date('2026-06-15T12:00:00Z');
const ago = (ms: number) => new Date(now.getTime() - ms);
const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

afterEach(() => vi.useRealTimers());

describe('the words', () => {
	it('says how long ago, in words', async () => {
		await render(RelativeTime, { date: ago(5 * MINUTE), now });
		expect(time().textContent?.trim()).toBe('5 minutes ago');
	});

	it('reads a moment ahead of now as in the future', async () => {
		await render(RelativeTime, { date: new Date(now.getTime() + 3 * HOUR), now });
		expect(time().textContent?.trim()).toBe('in 3 hours');
	});

	it('says "yesterday" rather than "1 day ago", and can be told not to', async () => {
		await render(RelativeTime, { date: ago(DAY), now });
		expect(time().textContent?.trim()).toBe('yesterday');
	});

	it('takes the locale, the width and the numeric rule', async () => {
		await render(RelativeTime, { date: ago(DAY), now, locale: 'de-DE' });
		expect(time().textContent?.trim()).toBe('gestern');
	});

	it('accepts a date, a timestamp or an ISO string', async () => {
		await render(RelativeTime, { date: ago(2 * HOUR).toISOString(), now });
		expect(time().textContent?.trim()).toBe('2 hours ago');
	});

	it('draws nothing for a date that is not one', async () => {
		await render(RelativeTime, { date: 'not a date', now });
		expect(time().textContent?.trim()).toBe('');
		expect(time().hasAttribute('datetime')).toBe(false);
	});
});

describe('what it puts on the element', () => {
	it('carries the exact instant for machines and the full date for a hover', async () => {
		await render(RelativeTime, { date: ago(5 * MINUTE), now, locale: 'en-US' });
		expect(time().getAttribute('datetime')).toBe(ago(5 * MINUTE).toISOString());
		expect(time().title).toContain('2026');
	});

	it('hands the words and the full date to a snippet', async () => {
		const seen: unknown[] = [];
		const { createRawSnippet } = await import('svelte');
		const children = createRawSnippet<[{ text: string; absolute: string }]>((context) => {
			seen.push(context());
			return { render: () => '<b>x</b>' };
		});
		await render(RelativeTime, { date: ago(5 * MINUTE), now, children });
		expect(seen[0]).toMatchObject({ text: '5 minutes ago' });
	});
});

describe('the cutoff', () => {
	it('falls back to the absolute date once the moment is too far away', async () => {
		await render(RelativeTime, {
			date: ago(10 * DAY),
			now,
			cutoff: 7 * DAY,
			titleFormat: { dateStyle: 'medium' }
		});
		expect(time().textContent?.trim()).toBe('Jun 5, 2026');
		// The text already is the date, so a hover would only repeat it.
		expect(time().hasAttribute('title')).toBe(false);
	});

	it('stays relative inside it', async () => {
		await render(RelativeTime, { date: ago(2 * DAY), now, cutoff: 7 * DAY });
		expect(time().textContent?.trim()).toBe('2 days ago');
	});
});

describe('staying current', () => {
	it('moves on by itself, at the moment its own words change', async () => {
		vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'Date'] });
		vi.setSystemTime(now);
		await render(RelativeTime, { date: ago(4 * MINUTE) });
		expect(time().textContent?.trim()).toBe('4 minutes ago');

		await vi.advanceTimersByTimeAsync(2 * MINUTE);
		await expect.poll(() => time().textContent?.trim()).toBe('6 minutes ago');
	});

	it('sets no timer at all when it is pinned or not live', async () => {
		vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'Date'] });
		vi.setSystemTime(now);
		await render(RelativeTime, { date: ago(4 * MINUTE), live: false });
		expect(vi.getTimerCount()).toBe(0);
	});

	it('catches up when the page comes back to the foreground', async () => {
		vi.useFakeTimers({ toFake: ['Date'] });
		vi.setSystemTime(now);
		await render(RelativeTime, { date: ago(4 * MINUTE) });

		vi.setSystemTime(new Date(now.getTime() + 20 * MINUTE));
		document.dispatchEvent(new Event('visibilitychange'));
		await expect.poll(() => time().textContent?.trim()).toBe('24 minutes ago');
	});
});
