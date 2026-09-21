/**
 * @coral/kit/avatar-stack
 * @version 1.0.0
 */

import { describe, expect, it } from 'vitest';
import { split } from './overflow.js';

const people = ['Ana', 'Beto', 'Carla', 'Dario', 'Elena', 'Fabio'];

describe('split', () => {
	it('draws everyone without a max', () => {
		expect(split(people)).toEqual({ visible: people, hidden: [] });
	});

	it('draws everyone when they fit exactly', () => {
		expect(split(people, 6)).toEqual({ visible: people, hidden: [] });
	});

	it('gives one slot to the count when the list overflows', () => {
		expect(split(people, 4)).toEqual({
			visible: ['Ana', 'Beto', 'Carla'],
			hidden: ['Dario', 'Elena', 'Fabio']
		});
	});

	it('never produces a count of one', () => {
		// Five slots for six people: a `+1` would hide one avatar behind a circle of the same size.
		const { hidden } = split(people, 5);
		expect(hidden.length).toBe(2);

		for (let max = 1; max <= people.length + 1; max++) {
			expect(split(people, max).hidden.length).not.toBe(1);
		}
	});

	it('reads a max below one as one', () => {
		expect(split(people, 0)).toEqual({ visible: [], hidden: people });
		expect(split(people, -3)).toEqual({ visible: [], hidden: people });
	});

	it('draws a single person rather than counting them', () => {
		expect(split(['Ana'], 1)).toEqual({ visible: ['Ana'], hidden: [] });
	});

	it('floors a fractional max', () => {
		expect(split(people, 3.9).visible).toEqual(['Ana', 'Beto']);
	});
});
