/**
 * @coral/kit/date-picker
 * @version 1.1.0
 */

import { describe, expect, it } from 'vitest';
import { formatDay, formatDayRange, isSameDay, isSameRange, toLocalDate } from './format.js';

const jan5 = { year: 2026, month: 1, day: 5 };
const jan9 = { year: 2026, month: 1, day: 9 };
const feb9 = { year: 2026, month: 2, day: 9 };

describe('toLocalDate', () => {
	it('reads a 1-based month the way DateValue numbers them', () => {
		const date = toLocalDate(jan5);
		expect([date.getFullYear(), date.getMonth(), date.getDate()]).toEqual([2026, 0, 5]);
	});

	it('lands on noon, so no DST jump can roll the day back', () => {
		expect(toLocalDate(jan5).getHours()).toBe(12);
	});

	it('keeps the day it was given, whatever the timezone offset', () => {
		// The bug this guards: building the day from an ISO string instead, which is UTC midnight
		// and therefore the previous day everywhere west of Greenwich.
		expect(toLocalDate({ year: 2026, month: 1, day: 1 }).getDate()).toBe(1);
	});

	it('reads only the day out of a value that also carries a time', () => {
		const date = toLocalDate({ ...jan5, hour: 23, minute: 30 } as never);
		expect(date.getDate()).toBe(5);
	});
});

describe('isSameDay', () => {
	it('matches on the day, not on identity', () => {
		expect(isSameDay(jan5, { ...jan5 })).toBe(true);
	});

	it('separates the same day in different months', () => {
		expect(isSameDay(jan9, feb9)).toBe(false);
	});

	it('ignores any time the values carry', () => {
		expect(isSameDay({ ...jan5, hour: 8 } as never, { ...jan5, hour: 20 } as never)).toBe(true);
	});

	it('treats two missing days as the same', () => {
		expect(isSameDay(undefined, undefined)).toBe(true);
	});

	it('never matches a missing day against a real one', () => {
		expect(isSameDay(undefined, jan5)).toBe(false);
	});
});

describe('isSameRange', () => {
	it('compares both ends', () => {
		expect(isSameRange({ start: jan5, end: jan9 }, { start: { ...jan5 }, end: { ...jan9 } })).toBe(
			true
		);
		expect(isSameRange({ start: jan5, end: jan9 }, { start: jan5, end: feb9 })).toBe(false);
	});

	it('does not let a half-picked range match a whole one', () => {
		expect(isSameRange({ start: jan5, end: undefined }, { start: jan5, end: jan9 })).toBe(false);
	});
});

describe('formatDay', () => {
	it('formats in the locale it is given', () => {
		expect(formatDay(jan5, 'en-US', { dateStyle: 'medium' })).toBe('Jan 5, 2026');
	});

	it('takes any Intl option set', () => {
		expect(formatDay(jan5, 'en-US', { day: '2-digit', month: 'long' })).toBe('January 05');
	});
});

describe('formatDayRange', () => {
	it('folds away what the two ends share', () => {
		const label = formatDayRange({ start: jan5, end: jan9 }, 'en-US', { dateStyle: 'medium' });
		// The point of `formatRange`: one "Jan" and one "2026", not two of each.
		expect(label).toMatch(/^Jan 5\s*–\s*9, 2026$/);
	});

	it('spells both ends out when they share nothing', () => {
		const label = formatDayRange({ start: jan5, end: feb9 }, 'en-US', { dateStyle: 'medium' });
		expect(label).toContain('Jan 5');
		expect(label).toContain('Feb 9');
	});

	it('collapses a one-day range to a single date', () => {
		expect(formatDayRange({ start: jan5, end: jan5 }, 'en-US', { dateStyle: 'medium' })).toBe(
			'Jan 5, 2026'
		);
	});

	it('prints the end that exists while the range is half picked', () => {
		expect(formatDayRange({ start: jan5, end: undefined }, 'en-US', { dateStyle: 'medium' })).toBe(
			'Jan 5, 2026'
		);
	});

	it('is empty when nothing is picked', () => {
		expect(formatDayRange({ start: undefined, end: undefined }, 'en-US', {})).toBe('');
	});
});
