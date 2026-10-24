/**
 * @coral/kit/breadcrumbs
 * @version 1.0.0
 */

import { describe, expect, it } from 'vitest';
import { foldCount } from './fit.js';

const widths = { items: [50, 60, 70, 80, 40], separator: 10, ellipsis: 20 };

describe('foldCount', () => {
	it('folds nothing while the trail fits', () => {
		// 300 of crumbs plus four separators.
		expect(foldCount(widths, 340)).toBe(0);
		expect(foldCount(widths, 1000)).toBe(0);
	});

	it('folds from the second crumb forward, as few as make it fit', () => {
		// Folding one: 50 + 10 + 20 + (10+70) + (10+80) + (10+40) = 300.
		expect(foldCount(widths, 300)).toBe(1);
		// Folding two: 50 + 10 + 20 + (10+80) + (10+40) = 220.
		expect(foldCount(widths, 250)).toBe(2);
	});

	it('never folds the first crumb or the current page', () => {
		expect(foldCount(widths, 10)).toBe(3);
		expect(foldCount({ ...widths, items: [50, 40] }, 10)).toBe(0);
	});

	it('has nothing to fold in a trail of one', () => {
		expect(foldCount({ ...widths, items: [500] }, 10)).toBe(0);
	});
});
