/**
 * @coral/kit/gauge
 * @version 1.0.0
 */

import { describe, expect, it } from 'vitest';
import { arcFor, fractionOf, normalize } from './arc.js';

describe('arcFor', () => {
	it('draws a full circle as two halves from twelve o’clock', () => {
		const { path, viewBox } = arcFor(360, 10);
		expect(path).toBe('M 50 5 A 45 45 0 0 1 50 95 A 45 45 0 0 1 50 5');
		expect(viewBox).toEqual({ x: 0, y: 0, width: 100, height: 100 });
	});

	it('opens anything shorter at the bottom, symmetric about the vertical', () => {
		const { path } = arcFor(180, 10);
		expect(path).toBe('M 5 50 A 45 45 0 0 1 50 5 A 45 45 0 0 1 95 50');
	});

	it('crops a half circle to the stroke, round caps included', () => {
		expect(arcFor(180, 10).viewBox).toEqual({ x: 0, y: 0, width: 100, height: 55 });
	});

	it('crops the sides of an arc that never reaches three o’clock', () => {
		const { viewBox } = arcFor(90, 10);
		expect(viewBox.width).toBeLessThan(100);
		expect(viewBox.x + viewBox.width / 2).toBeCloseTo(50);
	});

	it('cuts the middle to a drawing narrower than the stroke’s inside', () => {
		const { inner, viewBox } = arcFor(90, 10);
		expect(inner.x).toBeGreaterThanOrEqual(viewBox.x);
		expect(inner.x + inner.width).toBeLessThanOrEqual(viewBox.x + viewBox.width + 0.001);
	});

	it('keeps the middle inside the stroke and inside the drawing', () => {
		const { inner, viewBox } = arcFor(180, 10);
		expect(inner).toEqual({ x: 10, y: 10, width: 80, height: 45 });
		expect(inner.y + inner.height).toBeLessThanOrEqual(viewBox.height);
	});
});

describe('normalize', () => {
	it('holds the sweep to a circle and the stroke inside its radius', () => {
		expect(normalize(720, 80)).toEqual({ sweep: 360, thickness: 49 });
		expect(normalize(0, 0)).toEqual({ sweep: 1, thickness: 1 });
	});
});

describe('fractionOf', () => {
	it('is how far along the range a value is', () => {
		expect(fractionOf(25, 0, 100)).toBe(0.25);
		expect(fractionOf(15, 10, 20)).toBe(0.5);
	});

	it('clamps a reading past either end', () => {
		expect(fractionOf(140, 0, 100)).toBe(1);
		expect(fractionOf(-5, 0, 100)).toBe(0);
	});

	it('is empty for a range with no width, or a value that is not a number', () => {
		expect(fractionOf(5, 10, 10)).toBe(0);
		expect(fractionOf(Number.NaN, 0, 100)).toBe(0);
	});
});
