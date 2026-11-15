/**
 * @coral/kit/segmented-progress
 * @version 1.0.0
 */

import { describe, expect, it } from 'vitest';
import { rangeOf, stateOf } from './segments.js';

describe('rangeOf', () => {
	it('holds the value inside the segments', () => {
		expect(rangeOf(4, 2)).toEqual({ count: 4, value: 2 });
		expect(rangeOf(4, 9)).toEqual({ count: 4, value: 4 });
		expect(rangeOf(4, -1)).toEqual({ count: 4, value: 0 });
	});

	it('counts whole segments only, and never rounds a value up to one', () => {
		expect(rangeOf(3.7, 2.9)).toEqual({ count: 3, value: 2 });
	});

	it('draws nothing for a count or a value that is not a number', () => {
		expect(rangeOf(Number.NaN, 2)).toEqual({ count: 0, value: 0 });
		expect(rangeOf(-3, 2)).toEqual({ count: 0, value: 0 });
		expect(rangeOf(4, Number.NaN)).toEqual({ count: 4, value: 0 });
	});
});

describe('stateOf', () => {
	it('marks the steps before the value done, the value current and the rest ahead', () => {
		const states = [0, 1, 2, 3].map((index) => stateOf(index, 2, 'progress'));
		expect(states).toEqual(['complete', 'current', 'upcoming', 'upcoming']);
	});

	it('has no current step before the first one is reached', () => {
		expect(stateOf(0, 0, 'progress')).toBe('upcoming');
	});

	it('lights a meter up to its level, with nothing set apart', () => {
		const states = [0, 1, 2, 3].map((index) => stateOf(index, 3, 'meter'));
		expect(states).toEqual(['filled', 'filled', 'filled', 'empty']);
	});
});
