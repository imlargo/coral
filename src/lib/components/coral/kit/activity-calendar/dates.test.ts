/**
 * @coral/kit/activity-calendar
 * @version 1.0.0
 */

import { describe, expect, it } from 'vitest';
import { addDays, startOfWeek, toDate, toKey, weekdayAt } from './dates.js';

describe('toDate', () => {
	it('reads a bare calendar day as that day, not as UTC midnight', () => {
		const date = toDate('2026-01-05');
		expect([date.getFullYear(), date.getMonth(), date.getDate()]).toEqual([2026, 0, 5]);
	});

	it('round-trips through toKey', () => {
		expect(toKey(toDate('2024-02-29'))).toBe('2024-02-29');
	});

	it('lands on noon, so no DST jump can roll the day back', () => {
		expect(toDate('2026-01-05').getHours()).toBe(12);
	});

	it('reads a moment off the local clock', () => {
		expect(toKey(toDate(new Date(2026, 0, 5, 23, 30)))).toBe('2026-01-05');
	});

	it('rejects what is not a date', () => {
		expect(() => toDate('last tuesday')).toThrow(/Invalid activity date/);
	});
});

describe('toKey', () => {
	it('pads single-digit months and days', () => {
		expect(toKey(new Date(2026, 0, 5, 12))).toBe('2026-01-05');
	});

	it('sorts lexicographically in date order, which the grid relies on', () => {
		const keys = ['2026-01-05', '2025-12-31', '2026-01-10'].sort();
		expect(keys).toEqual(['2025-12-31', '2026-01-05', '2026-01-10']);
	});
});

describe('addDays', () => {
	it('crosses a month boundary', () => {
		expect(toKey(addDays(toDate('2026-01-31'), 1))).toBe('2026-02-01');
	});

	it('goes back', () => {
		expect(toKey(addDays(toDate('2026-03-01'), -1))).toBe('2026-02-28');
	});

	it('crosses a leap day', () => {
		expect(toKey(addDays(toDate('2024-02-28'), 1))).toBe('2024-02-29');
	});

	it('stays at noon', () => {
		expect(addDays(toDate('2026-01-05'), 200).getHours()).toBe(12);
	});
});

describe('startOfWeek', () => {
	it('walks back to the given weekday', () => {
		// 2026-01-07 is a Wednesday.
		expect(toKey(startOfWeek(toDate('2026-01-07'), 1))).toBe('2026-01-05');
		expect(toKey(startOfWeek(toDate('2026-01-07'), 0))).toBe('2026-01-04');
	});

	it('stays put when the day already starts the week', () => {
		expect(toKey(startOfWeek(toDate('2026-01-05'), 1))).toBe('2026-01-05');
	});

	it('never walks forward', () => {
		for (let weekStart = 0; weekStart < 7; weekStart++) {
			const date = toDate('2026-01-07');
			expect(startOfWeek(date, weekStart as 0).getTime()).toBeLessThanOrEqual(date.getTime());
		}
	});
});

describe('weekdayAt', () => {
	it('numbers the rows from the week start', () => {
		expect(weekdayAt(1, 0).getDay()).toBe(1);
		expect(weekdayAt(1, 6).getDay()).toBe(0);
		expect(weekdayAt(0, 0).getDay()).toBe(0);
		expect(weekdayAt(3, 2).getDay()).toBe(5);
	});
});
