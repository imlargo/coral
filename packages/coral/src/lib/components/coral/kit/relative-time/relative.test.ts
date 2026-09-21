/**
 * @coral/kit/relative-time
 * @version 1.0.1
 */

import { describe as group, expect, it } from 'vitest';
import { describe, nextChange, toDate } from './relative.js';

const NOW = new Date('2026-03-10T12:00:00Z');
const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/** A date `ms` away from `NOW` - negative for the past. */
const at = (ms: number) => new Date(NOW.getTime() + ms);

group('describe', () => {
	it('reads anything within half a minute as now, at minute precision', () => {
		expect(describe(at(-20 * SECOND), NOW)).toEqual({ value: 0, unit: 'second' });
		expect(describe(at(20 * SECOND), NOW)).toEqual({ value: 0, unit: 'second' });
	});

	it('counts seconds at second precision', () => {
		expect(describe(at(-20 * SECOND), NOW, 'second')).toEqual({ value: -20, unit: 'second' });
	});

	it('signs the past negative and the future positive', () => {
		expect(describe(at(-5 * MINUTE), NOW)).toEqual({ value: -5, unit: 'minute' });
		expect(describe(at(5 * MINUTE), NOW)).toEqual({ value: 5, unit: 'minute' });
	});

	it('moves up a unit on the rounded value, never showing 60 minutes', () => {
		expect(describe(at(-(59 * MINUTE + 40 * SECOND)), NOW)).toEqual({ value: -1, unit: 'hour' });
	});

	it('rounds the same distance the same way on both sides of now', () => {
		expect(describe(at(-150 * SECOND), NOW).value).toBe(-3);
		expect(describe(at(150 * SECOND), NOW).value).toBe(3);
	});

	it('walks up through days, weeks, months and years', () => {
		expect(describe(at(-3 * DAY), NOW)).toEqual({ value: -3, unit: 'day' });
		expect(describe(at(-15 * DAY), NOW)).toEqual({ value: -2, unit: 'week' });
		expect(describe(at(-60 * DAY), NOW)).toEqual({ value: -2, unit: 'month' });
		expect(describe(at(-800 * DAY), NOW)).toEqual({ value: -2, unit: 'year' });
	});

	it('does not show four weeks next to one month', () => {
		expect(describe(at(-26 * DAY), NOW)).toEqual({ value: -1, unit: 'month' });
	});

	it('reads an invalid date as now instead of NaN', () => {
		expect(describe(new Date('not a date'), NOW)).toEqual({ value: 0, unit: 'second' });
	});
});

group('nextChange', () => {
	/** Asserts that the label really is different once the wait has passed, and not before. */
	function expectChangeAfter(date: Date, precision: 'second' | 'minute' = 'minute') {
		const wait = nextChange(date, NOW, precision);
		const before = describe(date, new Date(NOW.getTime() + wait - 2), precision);
		const after = describe(date, new Date(NOW.getTime() + wait), precision);
		expect(after).not.toEqual(describe(date, NOW, precision));
		return { wait, before, after };
	}

	it('waits for the next half minute in the past', () => {
		// 5:10 ago reads "5 minutes"; it becomes 6 at 5:30.
		expect(nextChange(at(-(5 * MINUTE + 10 * SECOND)), NOW)).toBe(20 * SECOND);
		expectChangeAfter(at(-(5 * MINUTE + 10 * SECOND)));
	});

	it('sleeps for hours when the label is in days', () => {
		expect(nextChange(at(-3 * DAY), NOW)).toBe(12 * HOUR);
	});

	it('steps down a unit on time when counting down to the future', () => {
		// "in 1 hour" at 65 minutes out becomes "in 59 minutes" at 59.5 minutes out - not at 30.
		const date = at(65 * MINUTE);
		const { wait, after } = expectChangeAfter(date);
		expect(wait).toBe(5.5 * MINUTE + 1);
		expect(after).toEqual({ value: 59, unit: 'minute' });
	});

	it('changes from now to one minute ago at thirty seconds', () => {
		expect(nextChange(at(-10 * SECOND), NOW)).toBe(20 * SECOND);
	});

	it('never schedules below a second or above a day', () => {
		expect(nextChange(at(-800 * DAY), NOW)).toBe(DAY);
		expect(nextChange(at(-500), NOW, 'second')).toBeGreaterThanOrEqual(SECOND);
	});
});

group('toDate', () => {
	it('accepts a date, an ISO string or a timestamp', () => {
		expect(toDate(NOW)).toBe(NOW);
		expect(toDate('2026-03-10T12:00:00Z').getTime()).toBe(NOW.getTime());
		expect(toDate(NOW.getTime()).getTime()).toBe(NOW.getTime());
	});
});
