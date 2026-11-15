/**
 * @coral/kit/color-picker
 * @version 1.0.0
 */

import { describe, expect, it } from 'vitest';
import { hexToHsv, hsvToHex, parseHex } from './color.js';
import { keyStep } from './drag.js';

describe('parseHex', () => {
	it('reads what a reader types or pastes into one spelling', () => {
		expect(parseHex('#3B82F6')).toBe('#3b82f6');
		expect(parseHex('3b82f6')).toBe('#3b82f6');
		expect(parseHex('  #38f ')).toBe('#3388ff');
		expect(parseHex('38f')).toBe('#3388ff');
	});

	it('turns away anything that is not a hex colour', () => {
		expect(parseHex('#3b82f')).toBeUndefined();
		expect(parseHex('blue')).toBeUndefined();
		expect(parseHex('')).toBeUndefined();
		expect(parseHex(undefined)).toBeUndefined();
	});
});

describe('hsv', () => {
	it('round-trips the primaries', () => {
		expect(hsvToHex({ h: 0, s: 1, v: 1 })).toBe('#ff0000');
		expect(hsvToHex({ h: 120, s: 1, v: 1 })).toBe('#00ff00');
		expect(hsvToHex({ h: 240, s: 1, v: 1 })).toBe('#0000ff');
		expect(hexToHsv('#0000ff')).toEqual({ h: 240, s: 1, v: 1 });
	});

	it('wraps a hue past a full turn', () => {
		expect(hsvToHex({ h: 360, s: 1, v: 1 })).toBe('#ff0000');
		expect(hsvToHex({ h: -120, s: 1, v: 1 })).toBe('#0000ff');
	});

	it('keeps the hue it is given for a grey, which has none of its own', () => {
		expect(hexToHsv('#808080', 210).h).toBe(210);
		expect(hexToHsv('#000000', 45)).toEqual({ h: 45, s: 0, v: 0 });
	});

	it('lands back on the same hex', () => {
		for (const hex of ['#3b82f6', '#16a34a', '#f59e0b', '#ffffff', '#1e1e1e']) {
			expect(hsvToHex(hexToHsv(hex))).toBe(hex);
		}
	});
});

describe('keyStep', () => {
	const press = (key: string, shiftKey = false) => new KeyboardEvent('keydown', { key, shiftKey });

	it('moves a hundredth, and a tenth with Shift', () => {
		expect(keyStep(press('ArrowRight'), 'x')).toEqual({ by: 0.01 });
		expect(keyStep(press('ArrowLeft', true), 'x')).toEqual({ by: -0.1 });
	});

	it('pages the vertical axis, and jumps the horizontal one to its ends', () => {
		expect(keyStep(press('PageDown'), 'y')).toEqual({ by: -0.1 });
		expect(keyStep(press('End'), 'x')).toEqual({ to: 1 });
	});

	it('leaves a key that moves nothing on that axis', () => {
		expect(keyStep(press('ArrowUp'), 'x')).toBeUndefined();
		expect(keyStep(press('Home'), 'y')).toBeUndefined();
	});
});
