/**
 * @coral/kit/activity-calendar
 * @version 1.0.0
 */

import { describe, expect, it } from 'vitest';
import { levelFor, thresholdsFor } from './levels.js';

describe('thresholdsFor', () => {
	it('starts level one at any activity at all', () => {
		expect(thresholdsFor([0, 0, 40, 80], 4)[0]).toBe(1);
	});

	it('splits the non-zero days into even quantiles', () => {
		expect(thresholdsFor([1, 2, 3, 4, 5, 6, 7, 8], 4)).toEqual([1, 3, 5, 7]);
	});

	it('ignores the zeroes, which would otherwise swallow the scale', () => {
		const zeroes = Array.from({ length: 300 }, () => 0);
		expect(thresholdsFor([...zeroes, 1, 2, 3, 4, 5, 6, 7, 8], 4)).toEqual([1, 3, 5, 7]);
	});

	it('is not dragged by one huge day the way equal bands would be', () => {
		// Equal bands over 0..1000 would put every one of these in the first band.
		const cuts = thresholdsFor([1, 2, 3, 4, 5, 6, 7, 1000], 4);
		expect(cuts).toEqual([1, 3, 5, 7]);
	});

	it('keeps the cuts apart when the data is flat', () => {
		expect(thresholdsFor([1, 1, 1, 1], 4)).toEqual([1, 2, 3, 4]);
	});

	it('always comes back ascending', () => {
		const cuts = thresholdsFor([9, 1, 1, 1, 1, 1, 2, 40], 5);
		expect(cuts).toEqual([...cuts].sort((a, b) => a - b));
		expect(new Set(cuts).size).toBe(cuts.length);
	});

	it('gives one cut per level', () => {
		expect(thresholdsFor([1, 2, 3], 6)).toHaveLength(6);
	});

	it('survives having nothing to read', () => {
		expect(thresholdsFor([], 4)).toEqual([1, 2, 3, 4]);
	});

	it('has no cuts when there are no levels', () => {
		expect(thresholdsFor([1, 2, 3], 0)).toEqual([]);
	});
});

describe('levelFor', () => {
	it('puts an empty day at zero', () => {
		expect(levelFor(0, [1, 3, 5, 7])).toBe(0);
		expect(levelFor(-2, [1, 3, 5, 7])).toBe(0);
	});

	it('reads the cuts as lower bounds', () => {
		expect(levelFor(1, [1, 3, 5, 7])).toBe(1);
		expect(levelFor(2, [1, 3, 5, 7])).toBe(1);
		expect(levelFor(3, [1, 3, 5, 7])).toBe(2);
		expect(levelFor(7, [1, 3, 5, 7])).toBe(4);
	});

	it('caps at the last level however big the count is', () => {
		expect(levelFor(9000, [1, 3, 5, 7])).toBe(4);
	});

	it('has only the empty level when there are no cuts', () => {
		expect(levelFor(50, [])).toBe(0);
	});
});
