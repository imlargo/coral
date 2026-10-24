/**
 * @coral/kit/reorder-list
 * @version 1.0.0
 */

import { describe, expect, it } from 'vitest';
import { keyTarget, move, targetIndex } from './reorder.js';

describe('move', () => {
	const steps = ['lint', 'test', 'build', 'deploy'];

	it('moves an entry down', () => {
		expect(move(steps, 0, 2)).toEqual(['test', 'build', 'lint', 'deploy']);
	});

	it('moves an entry up', () => {
		expect(move(steps, 3, 1)).toEqual(['lint', 'deploy', 'test', 'build']);
	});

	it('never mutates the list it was given', () => {
		const copy = [...steps];
		move(steps, 0, 3);
		expect(steps).toEqual(copy);
	});

	it('clamps a target past either end', () => {
		expect(move(steps, 1, 99)).toEqual(['lint', 'build', 'deploy', 'test']);
		expect(move(steps, 2, -5)).toEqual(['build', 'lint', 'test', 'deploy']);
	});

	it('returns an unchanged copy for a source out of range', () => {
		expect(move(steps, 9, 0)).toEqual(steps);
	});
});

describe('targetIndex', () => {
	// Four rows, 40px tall, stacked from the top.
	const midpoints = [20, 60, 100, 140];

	it('stays put while the dragged row has not covered half of a neighbour', () => {
		expect(targetIndex(midpoints, 0, 55)).toBe(0);
	});

	it('swaps once the centre passes the neighbour’s centre', () => {
		expect(targetIndex(midpoints, 0, 61)).toBe(1);
	});

	it('moves up the same way', () => {
		expect(targetIndex(midpoints, 3, 99)).toBe(2);
		expect(targetIndex(midpoints, 3, 10)).toBe(0);
	});

	it('lands at the end past the last row', () => {
		expect(targetIndex(midpoints, 1, 500)).toBe(3);
	});
});

describe('keyTarget', () => {
	it('steps one place with the arrows, clamped', () => {
		expect(keyTarget('ArrowUp', 2, 4)).toBe(1);
		expect(keyTarget('ArrowDown', 3, 4)).toBe(3);
		expect(keyTarget('ArrowUp', 0, 4)).toBe(0);
	});

	it('jumps to either end with Home and End', () => {
		expect(keyTarget('Home', 2, 4)).toBe(0);
		expect(keyTarget('End', 0, 4)).toBe(3);
	});

	it('ignores any other key', () => {
		expect(keyTarget('Enter', 1, 4)).toBeNull();
	});
});
