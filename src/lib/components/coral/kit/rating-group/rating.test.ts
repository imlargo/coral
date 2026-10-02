/**
 * @coral/kit/rating-group
 * @version 1.0.0
 */

import { describe, expect, it } from 'vitest';
import { fillOf, snap, stepsFor } from './rating.js';

describe('stepsFor', () => {
	it('is one option per star', () => {
		expect(stepsFor(5)).toEqual([1, 2, 3, 4, 5]);
	});

	it('doubles the options rather than adding a mode', () => {
		expect(stepsFor(3, true)).toEqual([0.5, 1, 1.5, 2, 2.5, 3]);
	});

	it('never offers zero - that is the absence of a rating, not one of them', () => {
		expect(stepsFor(5, true)).not.toContain(0);
	});

	it('stops at the last star', () => {
		expect(stepsFor(4, true).at(-1)).toBe(4);
		expect(stepsFor(4).at(-1)).toBe(4);
	});

	it('lands on exact halves, with no accumulated drift', () => {
		expect(stepsFor(50, true)).toContain(33.5);
		expect(stepsFor(50, true)).toHaveLength(100);
	});

	it('has nothing to offer for a count of none', () => {
		expect(stepsFor(0, true)).toEqual([]);
	});

	it('reads a fractional count as whole stars', () => {
		expect(stepsFor(3.7)).toEqual([1, 2, 3]);
	});
});

describe('fillOf', () => {
	it('fills every star below the rating', () => {
		expect(fillOf(3, 0)).toBe(1);
		expect(fillOf(3, 2)).toBe(1);
	});

	it('leaves every star above it empty', () => {
		expect(fillOf(3, 3)).toBe(0);
		expect(fillOf(3, 4)).toBe(0);
	});

	it('gives the straddled star the remainder, unrounded', () => {
		expect(fillOf(4.3, 4)).toBeCloseTo(0.3);
		expect(fillOf(2.5, 2)).toBe(0.5);
	});

	it('never leaves the 0..1 range', () => {
		expect(fillOf(-2, 0)).toBe(0);
		expect(fillOf(99, 0)).toBe(1);
	});

	it('reads a rating that is not a number as no rating', () => {
		expect(fillOf(Number.NaN, 0)).toBe(0);
	});
});

describe('snap', () => {
	it('leaves a value that is already a step alone', () => {
		expect(snap(3, 5)).toBe(3);
		expect(snap(2.5, 5, true)).toBe(2.5);
	});

	it('rounds an average onto the nearest step', () => {
		expect(snap(4.3, 5)).toBe(4);
		expect(snap(4.3, 5, true)).toBe(4.5);
		expect(snap(4.6, 5)).toBe(5);
	});

	it('clamps into the range', () => {
		expect(snap(12, 5)).toBe(5);
		expect(snap(-3, 5)).toBe(0);
	});

	it('reads nothing as no rating', () => {
		expect(snap(0, 5)).toBe(0);
		expect(snap(Number.NaN, 5)).toBe(0);
		expect(snap(Number.POSITIVE_INFINITY, 5)).toBe(0);
	});

	it('rounds a sliver of a rating down to none, the way it rounds anything else', () => {
		expect(snap(0.2, 5, true)).toBe(0);
		expect(snap(0.4, 5)).toBe(0);
	});

	it('only ever lands on a step, or on no rating at all', () => {
		const landings = [0, ...stepsFor(5, true)];
		for (const raw of [0.2, 0.9, 1.1, 2.74, 3.26, 4.99]) {
			expect(landings).toContain(snap(raw, 5, true));
		}
	});
});
