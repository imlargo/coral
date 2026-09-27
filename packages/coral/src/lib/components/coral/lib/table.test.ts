/**
 * @coral/lib/table
 * @version 1.0.0
 */

import { describe, expect, it } from 'vitest';
import {
	clampPage,
	compare,
	filterRows,
	idsBetween,
	nextSort,
	pageCount,
	paginate,
	selectionState,
	sortRows,
	toggleAll,
	toggleId
} from './table.js';

type Deploy = {
	id: string;
	project: string;
	status: string;
	duration: number | null;
	at: Date;
};

const deploys: Deploy[] = [
	{ id: 'a', project: 'Açaí', status: 'ready', duration: 42, at: new Date('2026-03-01') },
	{ id: 'b', project: 'kiwi', status: 'failed', duration: null, at: new Date('2026-03-03') },
	{ id: 'c', project: 'Mango', status: 'ready', duration: 9, at: new Date('2026-03-02') },
	{ id: 'd', project: 'papaya', status: 'building', duration: 42, at: new Date('2026-03-04') }
];

const value = (row: Deploy, column: string) => row[column as keyof Deploy];
const ids = (rows: Deploy[]) => rows.map((row) => row.id);

describe('nextSort', () => {
	it('walks ascending, descending, none', () => {
		const first = nextSort(undefined, 'project');
		expect(first).toEqual({ column: 'project', direction: 'asc' });

		const second = nextSort(first, 'project');
		expect(second).toEqual({ column: 'project', direction: 'desc' });

		expect(nextSort(second, 'project')).toBeUndefined();
	});

	it('starts a different column at ascending, whatever the last one was doing', () => {
		const descending = { column: 'project' as const, direction: 'desc' as const };
		expect(nextSort(descending, 'status')).toEqual({ column: 'status', direction: 'asc' });
	});
});

describe('compare', () => {
	it('orders numbers numerically, not as text', () => {
		expect(compare(9, 10)).toBeLessThan(0);
	});

	it('orders text through a collator, so digits and accents file where people expect', () => {
		expect(compare('item 9', 'item 10')).toBeLessThan(0);
		expect(compare('Ángel', 'Bruno')).toBeLessThan(0);
		expect(compare('acai', 'Açaí')).toBe(0);
	});

	it('orders dates and booleans', () => {
		expect(compare(new Date('2026-01-01'), new Date('2026-06-01'))).toBeLessThan(0);
		expect(compare(false, true)).toBeLessThan(0);
	});

	it('puts blanks last, whichever side they are on', () => {
		expect(compare(null, 5)).toBeGreaterThan(0);
		expect(compare(5, undefined)).toBeLessThan(0);
		expect(compare('', 'a')).toBeGreaterThan(0);
		expect(compare(null, undefined)).toBe(0);
	});
});

describe('sortRows', () => {
	it('sorts ascending and descending', () => {
		expect(ids(sortRows(deploys, { column: 'project', direction: 'asc' }, { value }))).toEqual([
			'a',
			'b',
			'c',
			'd'
		]);
		expect(ids(sortRows(deploys, { column: 'project', direction: 'desc' }, { value }))).toEqual([
			'd',
			'c',
			'b',
			'a'
		]);
	});

	it('keeps blanks last in both directions', () => {
		const asc = sortRows(deploys, { column: 'duration', direction: 'asc' }, { value });
		const desc = sortRows(deploys, { column: 'duration', direction: 'desc' }, { value });
		expect(asc.at(-1)?.id).toBe('b');
		expect(desc.at(-1)?.id).toBe('b');
	});

	it('is stable, so rows that tie stay as they came', () => {
		// `a` and `d` both took 42 seconds, and `a` came first.
		const sorted = sortRows(deploys, { column: 'duration', direction: 'asc' }, { value });
		expect(ids(sorted)).toEqual(['c', 'a', 'd', 'b']);
	});

	it('returns an unsorted copy when nothing is sorted', () => {
		const sorted = sortRows(deploys, undefined, { value });
		expect(sorted).toEqual(deploys);
		expect(sorted).not.toBe(deploys);
	});

	it('never touches the rows it was given', () => {
		const copy = [...deploys];
		sortRows(deploys, { column: 'project', direction: 'desc' }, { value });
		expect(deploys).toEqual(copy);
	});

	it('takes a comparison the default could not know', () => {
		const order = ['building', 'ready', 'failed'];
		const sorted = sortRows(
			deploys,
			{ column: 'status', direction: 'asc' },
			{
				value,
				compare: { status: (a, b) => order.indexOf(a.status) - order.indexOf(b.status) }
			}
		);
		expect(sorted.map((row) => row.status)).toEqual(['building', 'ready', 'ready', 'failed']);
	});
});

describe('filterRows', () => {
	const text = (row: Deploy) => [row.project, row.status, row.duration];

	it('matches across every field at once', () => {
		expect(ids(filterRows(deploys, 'failed', text))).toEqual(['b']);
	});

	it('needs every word, in any order and any field', () => {
		expect(ids(filterRows(deploys, 'mango ready', text))).toEqual(['c']);
		expect(ids(filterRows(deploys, 'ready mango', text))).toEqual(['c']);
		expect(ids(filterRows(deploys, 'mango failed', text))).toEqual([]);
	});

	it('folds accents, the way the combobox searches', () => {
		expect(ids(filterRows(deploys, 'acai', text))).toEqual(['a']);
	});

	it('ignores case and stray whitespace', () => {
		expect(ids(filterRows(deploys, '  KIWI  ', text))).toEqual(['b']);
	});

	it('returns everything for an empty term', () => {
		expect(filterRows(deploys, '   ', text)).toEqual(deploys);
	});

	it('does not match the word "null" against a blank cell', () => {
		expect(filterRows(deploys, 'null', text)).toEqual([]);
	});
});

describe('paging', () => {
	it('counts pages, and an empty table is page 1 of 1', () => {
		expect(pageCount(10, 4)).toBe(3);
		expect(pageCount(0, 10)).toBe(1);
		expect(pageCount(10, 0)).toBe(1);
	});

	it('slices the page asked for', () => {
		expect(ids(paginate(deploys, 2, 2))).toEqual(['c', 'd']);
	});

	it('holds a page past the end at the last one, rather than showing nothing', () => {
		expect(clampPage(7, 4, 2)).toBe(2);
		expect(ids(paginate(deploys, 7, 2))).toEqual(['c', 'd']);
	});

	it('reads a size of zero as no paging', () => {
		expect(paginate(deploys, 3, 0)).toEqual(deploys);
	});

	it('survives a nonsense page number', () => {
		expect(clampPage(0, 4, 2)).toBe(1);
		expect(clampPage(Number.NaN, 4, 2)).toBe(1);
	});
});

describe('selection', () => {
	const visible = ['a', 'b', 'c'];

	it('adds and removes one id, keeping the order of the rest', () => {
		expect(toggleId(['a', 'b'], 'c')).toEqual(['a', 'b', 'c']);
		expect(toggleId(['a', 'b', 'c'], 'b')).toEqual(['a', 'c']);
	});

	it('draws a range in either direction', () => {
		expect(idsBetween(['a', 'b', 'c', 'd'], 'b', 'd')).toEqual(['b', 'c', 'd']);
		expect(idsBetween(['a', 'b', 'c', 'd'], 'd', 'b')).toEqual(['b', 'c', 'd']);
		expect(idsBetween(['a', 'b'], 'a', 'z')).toEqual([]);
	});

	it('reads the three states of the header checkbox', () => {
		expect(selectionState([], visible)).toBe('none');
		expect(selectionState(['b'], visible)).toBe('some');
		expect(selectionState(['a', 'b', 'c'], visible)).toBe('all');
	});

	it('answers for the rows on screen, not for the ones a filter hid', () => {
		expect(selectionState(['a', 'b', 'c', 'z'], visible)).toBe('all');
		expect(selectionState(['z'], visible)).toBe('none');
		expect(selectionState(['a'], [])).toBe('none');
	});

	it('selects and clears the visible rows without touching the rest', () => {
		expect(toggleAll(['z'], visible)).toEqual(['z', 'a', 'b', 'c']);
		expect(toggleAll(['z', 'a', 'b', 'c'], visible)).toEqual(['z']);
	});

	it('completes a partial selection rather than clearing it', () => {
		expect(toggleAll(['b'], visible)).toEqual(['b', 'a', 'c']);
	});
});
