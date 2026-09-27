/**
 * @coral/kit/scrub-input
 * @version 1.0.0
 */

import { describe, expect, it } from 'vitest';
import { amountFor, consume } from './scrub.js';

describe('consume', () => {
	it('spends whole steps and keeps the change', () => {
		expect(consume(9, 4)).toEqual({ steps: 2, rest: 1 });
	});

	it('takes nothing from a distance shorter than a step', () => {
		expect(consume(3, 4)).toEqual({ steps: 0, rest: 3 });
	});

	it('adds up a slow drag, instead of rounding every move to nothing', () => {
		let rest = 0;
		let steps = 0;
		// Twelve moves of a pixel each, the shape a slow pointer actually reports.
		for (let move = 0; move < 12; move++) {
			const taken = consume(rest + 1, 4);
			steps += taken.steps;
			rest = taken.rest;
		}
		expect(steps).toBe(3);
	});

	it('works the same backwards', () => {
		expect(consume(-9, 4)).toEqual({ steps: -2, rest: -1 });
	});

	it('spends the same distance in either direction across a turn', () => {
		expect(consume(3.9, 4).steps).toBe(0);
		expect(consume(-3.9, 4).steps).toBe(0);
	});

	it('takes a step per pixel when that is the sensitivity', () => {
		expect(consume(7, 1)).toEqual({ steps: 7, rest: 0 });
	});

	it('refuses a sensitivity of zero rather than dividing by it', () => {
		expect(consume(10, 0)).toEqual({ steps: 0, rest: 0 });
		expect(consume(10, -2)).toEqual({ steps: 0, rest: 0 });
	});

	it('survives a non-finite distance', () => {
		expect(consume(Number.NaN, 4)).toEqual({ steps: 0, rest: 0 });
	});
});

describe('amountFor', () => {
	it('is the step, or the large one while the coarse modifier is held', () => {
		expect(amountFor(1, 10, false)).toBe(1);
		expect(amountFor(1, 10, true)).toBe(10);
	});

	it('carries fractional steps through untouched', () => {
		expect(amountFor(0.1, 1, false)).toBe(0.1);
	});
});
