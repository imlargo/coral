/**
 * @coral/kit/timeline
 * @version 1.0.0
 */

import { describe, expect, it } from 'vitest';
import { dayKey, daysBetween, groupByDay } from './days.js';

describe('dayKey', () => {
	it('reads the day in the zone asked for', () => {
		// 23:30 in New York is already the 25th in UTC and in Tokyo.
		const late = new Date('2026-10-25T03:30:00Z');
		expect(dayKey(late, 'America/New_York')).toBe('2026-10-24');
		expect(dayKey(late, 'UTC')).toBe('2026-10-25');
		expect(dayKey(late, 'Asia/Tokyo')).toBe('2026-10-25');
	});
});

describe('daysBetween', () => {
	it('counts calendar days, whatever the hours were', () => {
		expect(daysBetween('2026-10-24', '2026-10-24')).toBe(0);
		expect(daysBetween('2026-10-23', '2026-10-24')).toBe(1);
		expect(daysBetween('2026-10-24', '2026-10-23')).toBe(-1);
		expect(daysBetween('2025-12-31', '2026-01-01')).toBe(1);
	});
});

describe('groupByDay', () => {
	const events = [
		{ id: 'a', at: '2026-10-24T22:10:00Z' },
		{ id: 'b', at: '2026-10-24T09:00:00Z' },
		{ id: 'c', at: '2026-10-23T23:59:00Z' },
		{ id: 'd', at: '2026-10-22T12:00:00Z' }
	];

	it('groups consecutive events that share a day, in the order given', () => {
		const groups = groupByDay(events, (event) => event.at, 'UTC');
		expect(groups.map((group) => [group.key, group.items.map((entry) => entry.item.id)])).toEqual([
			['2026-10-24', ['a', 'b']],
			['2026-10-23', ['c']],
			['2026-10-22', ['d']]
		]);
	});

	it('draws the day line where the reader is, not where UTC is', () => {
		// In Bogotá, 22:10 UTC is 17:10 the same day, but 23:59 UTC on the 23rd is still the 23rd,
		// and an event at 03:00 UTC on the 24th is the evening of the 23rd.
		const evening = [{ id: 'e', at: '2026-10-24T03:00:00Z' }, ...events.slice(2)];
		const groups = groupByDay(evening, (event) => event.at, 'America/Bogota');
		expect(groups.map((group) => group.key)).toEqual(['2026-10-23', '2026-10-22']);
	});

	it('keeps the first event of a day as the one to format the heading from', () => {
		const [first] = groupByDay(events, (event) => event.at, 'UTC');
		expect(first.day.toISOString()).toBe('2026-10-24T22:10:00.000Z');
	});

	it('has no groups for no events', () => {
		expect(groupByDay([], () => 0)).toEqual([]);
	});
});
