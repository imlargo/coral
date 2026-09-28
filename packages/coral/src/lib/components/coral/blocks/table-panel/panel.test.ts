/**
 * @coral/blocks/table-panel
 * @version 1.0.0
 */

import { describe, expect, it } from 'vitest';
import { buildPanel } from './panel.js';

type Run = { id: string; project: string; status: string };

/** Twelve runs across four projects, so paging and filtering both have something to do. */
const runs: Run[] = Array.from({ length: 12 }, (_, index) => ({
	id: String(index + 1),
	project: ['Açaí', 'Kiwi', 'Mango', 'Papaya'][index % 4],
	status: index % 3 === 0 ? 'failed' : 'ready'
}));

const options = {
	rows: runs,
	term: '',
	text: (row: Run) => [row.project, row.status],
	sort: undefined,
	sorting: { value: (row: Run, column: string) => row[column as keyof Run] },
	page: 1,
	pageSize: 5
};

const ids = (rows: Run[]) => rows.map((row) => row.id);

describe('buildPanel', () => {
	it('cuts the rows to the page, and says where they sit', () => {
		const panel = buildPanel(options);
		expect(ids(panel.rows)).toEqual(['1', '2', '3', '4', '5']);
		expect([panel.from, panel.to, panel.total, panel.pages]).toEqual([1, 5, 12, 3]);
	});

	it('numbers the last, short page correctly', () => {
		const panel = buildPanel({ ...options, page: 3 });
		expect([panel.from, panel.to]).toEqual([11, 12]);
		expect(panel.rows).toHaveLength(2);
	});

	it('searches the whole list, not just the page being shown', () => {
		// Papaya's runs are 4, 8 and 12 - two of them are past the first page.
		const panel = buildPanel({ ...options, term: 'papaya' });
		expect(ids(panel.matched)).toEqual(['4', '8', '12']);
		expect(panel.searching).toBe(true);
	});

	it('sorts what the search left, not what it was given', () => {
		const panel = buildPanel({
			...options,
			term: 'failed',
			sort: { column: 'project', direction: 'asc' }
		});
		expect(panel.matched.map((row) => row.project)).toEqual(['Açaí', 'Kiwi', 'Mango', 'Papaya']);
	});

	it('brings a page past the end back to the last one', () => {
		const panel = buildPanel({ ...options, term: 'papaya', page: 7 });
		expect(panel.page).toBe(1);
		expect(ids(panel.rows)).toEqual(['4', '8', '12']);
	});

	it('reports an empty range when nothing matched', () => {
		const panel = buildPanel({ ...options, term: 'lychee' });
		expect([panel.rows.length, panel.from, panel.to, panel.pages]).toEqual([0, 0, 0, 1]);
		expect(panel.total).toBe(12);
	});

	it('knows the difference between empty and nothing found', () => {
		expect(buildPanel({ ...options, rows: [] }).searching).toBe(false);
		expect(buildPanel({ ...options, rows: [], term: 'kiwi' }).searching).toBe(true);
	});

	it('puts everything on one page when paging is off', () => {
		const panel = buildPanel({ ...options, pageSize: 0 });
		expect(panel.rows).toHaveLength(12);
		expect([panel.pages, panel.from, panel.to]).toEqual([1, 1, 12]);
	});
});
