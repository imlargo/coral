/**
 * @coral/kit/activity-calendar
 * @version 1.0.0
 */

import { describe, expect, it } from 'vitest';
import { buildGrid } from './grid.js';
import { toKey } from './dates.js';

describe('buildGrid', () => {
	it('draws every day between the ends, not only the ones given', () => {
		const grid = buildGrid([{ date: '2026-01-05', count: 3 }], {
			start: '2026-01-05',
			end: '2026-01-11'
		});
		expect(grid.cells).toHaveLength(7);
		expect(grid.cells.filter((cell) => cell.count === 0)).toHaveLength(6);
	});

	it('sums repeated dates instead of keeping the last one', () => {
		const grid = buildGrid([
			{ date: '2026-01-05', count: 1 },
			{ date: '2026-01-05', count: 2 }
		]);
		expect(grid.cells[0].count).toBe(3);
		expect(grid.total).toBe(3);
	});

	it('sums a calendar day and a moment that fall on the same day', () => {
		const grid = buildGrid([
			{ date: '2026-01-05', count: 1 },
			{ date: new Date(2026, 0, 5, 23, 30), count: 4 }
		]);
		expect(grid.cells).toHaveLength(1);
		expect(grid.cells[0].count).toBe(5);
	});

	it('pads the first and last columns with holes rather than with empty days', () => {
		// A Wednesday to a Wednesday, weeks starting Monday: two ragged columns.
		const grid = buildGrid([], { start: '2026-01-07', end: '2026-01-14', weekStart: 1 });
		expect(grid.weeks).toHaveLength(2);
		expect(grid.weeks[0].days.slice(0, 2)).toEqual([null, null]);
		expect(grid.weeks[1].days.slice(3)).toEqual([null, null, null, null]);
	});

	it('gives every column seven slots whatever the range', () => {
		const grid = buildGrid([], { start: '2026-01-07', end: '2026-03-04', weekStart: 0 });
		expect(grid.weeks.every((week) => week.days.length === 7)).toBe(true);
	});

	it('reads its own range off the data when none is given', () => {
		const grid = buildGrid([
			{ date: '2026-03-10', count: 1 },
			{ date: '2026-01-05', count: 1 }
		]);
		expect(toKey(grid.start)).toBe('2026-01-05');
		expect(toKey(grid.end)).toBe('2026-03-10');
	});

	it('counts only what the range shows', () => {
		const grid = buildGrid(
			[
				{ date: '2026-01-05', count: 5 },
				{ date: '2026-02-05', count: 100 }
			],
			{ start: '2026-01-01', end: '2026-01-31' }
		);
		expect(grid.total).toBe(5);
	});

	it('scales the levels to the range, not to data outside it', () => {
		const days = [
			{ date: '2026-01-05', count: 2 },
			{ date: '2026-06-05', count: 900 }
		];
		const levelOfTheTwo = (grid: ReturnType<typeof buildGrid>) =>
			grid.cells.find((cell) => cell.count === 2)?.level;

		// Against the whole dataset a 2 sits next to a 900, so it is the palest level there is.
		expect(levelOfTheTwo(buildGrid(days))).toBe(1);
		// Against January alone it is the only day there is, and it moves up the ramp.
		expect(levelOfTheTwo(buildGrid(days, { start: '2026-01-01', end: '2026-01-31' }))).toBe(2);
	});

	it('numbers the cells chronologically, which is what the arrow keys step through', () => {
		const grid = buildGrid([], { start: '2026-01-05', end: '2026-01-25', weekStart: 1 });
		expect(grid.cells.map((cell) => cell.index)).toEqual(grid.cells.map((_, at) => at));
		// Seven steps along the list is one column across, on the same row.
		expect(grid.cells[0].weekday).toBe(grid.cells[7].weekday);
		expect(grid.cells[7].week).toBe(grid.cells[0].week + 1);
	});

	it('places every cell where the week and weekday it reports say it is', () => {
		const grid = buildGrid([], { start: '2026-01-07', end: '2026-02-14', weekStart: 1 });
		for (const cell of grid.cells) {
			expect(grid.weeks[cell.week].days[cell.weekday]).toBe(cell);
		}
	});

	it('reports the cuts it used, given or computed', () => {
		expect(buildGrid([{ date: '2026-01-05', count: 1 }], { levels: 3 }).thresholds).toHaveLength(3);
		expect(buildGrid([], { thresholds: [1, 4, 9] }).thresholds).toEqual([1, 4, 9]);
	});

	it('lets the caller override a level the data already bucketed', () => {
		const grid = buildGrid([{ date: '2026-01-05', count: 1, level: 4 }]);
		expect(grid.cells[0].level).toBe(4);
	});

	it('carries meta through untouched', () => {
		const grid = buildGrid<{ repo: string }>([
			{ date: '2026-01-05', count: 1, meta: { repo: 'coral' } }
		]);
		expect(grid.cells[0].meta).toEqual({ repo: 'coral' });
	});

	it('groups the columns into month runs that add up to the grid', () => {
		const grid = buildGrid([], { start: '2026-01-01', end: '2026-03-31', weekStart: 1 });
		const spans = grid.months.reduce((sum, month) => sum + month.span, 0);
		expect(spans).toBe(grid.weeks.length);
	});

	it('names a month run after the month its first drawn day falls in', () => {
		const grid = buildGrid([], { start: '2026-01-01', end: '2026-02-28', weekStart: 1 });
		expect(grid.months[0].date.getMonth()).toBe(0);
		expect(grid.months[1].date.getMonth()).toBe(1);
	});

	it('keeps month runs apart across a year boundary', () => {
		const grid = buildGrid([], { start: '2025-01-01', end: '2026-03-31', weekStart: 1 });
		expect(new Set(grid.months.map((month) => month.key)).size).toBe(grid.months.length);
	});

	it('is empty rather than broken when there is nothing to draw', () => {
		const grid = buildGrid([]);
		expect(grid.weeks).toEqual([]);
		expect(grid.cells).toEqual([]);
	});

	it('is empty when the range runs backwards', () => {
		const grid = buildGrid([{ date: '2026-01-05', count: 1 }], {
			start: '2026-02-01',
			end: '2026-01-01'
		});
		expect(grid.cells).toEqual([]);
	});

	it('draws a single day as a single square', () => {
		const grid = buildGrid([{ date: '2026-01-05', count: 1 }]);
		expect(grid.cells).toHaveLength(1);
		expect(grid.weeks).toHaveLength(1);
	});
});
