/**
 * @coral/lib/number
 * @version 1.1.0
 */

import { describe, expect, it } from 'vitest';
import { clamp, decimalsOf, format, parse, round, stepValue } from './number.js';

describe('decimalsOf', () => {
	it('counts the decimals of a fractional step', () => {
		expect(decimalsOf(0.1)).toBe(1);
		expect(decimalsOf(0.05)).toBe(2);
		expect(decimalsOf(0.125)).toBe(3);
	});

	it('is zero for whole steps', () => {
		expect(decimalsOf(1)).toBe(0);
		expect(decimalsOf(250)).toBe(0);
	});

	it('ignores the sign', () => {
		expect(decimalsOf(-0.01)).toBe(2);
	});

	it('reads exponent notation, which has no decimal point to count', () => {
		expect(decimalsOf(1e-7)).toBe(7);
		expect(decimalsOf(1.5e-7)).toBe(8);
	});

	it('does not blow up on a non-finite step', () => {
		expect(decimalsOf(Number.POSITIVE_INFINITY)).toBe(0);
		expect(decimalsOf(Number.NaN)).toBe(0);
	});
});

describe('round', () => {
	it('cleans up binary float drift', () => {
		expect(round(0.1 + 0.2, 1)).toBe(0.3);
		expect(round(0.3 - 0.1, 1)).toBe(0.2);
	});

	it('rounds to whole numbers at zero decimals', () => {
		expect(round(2.6, 0)).toBe(3);
	});

	it('leaves an exact value alone', () => {
		expect(round(5, 0)).toBe(5);
		expect(round(1.25, 2)).toBe(1.25);
	});

	it('survives a silly precision', () => {
		expect(round(1.5, 999)).toBe(1.5);
		expect(round(1.5, -3)).toBe(2);
	});
});

describe('clamp', () => {
	it('holds the value inside both bounds', () => {
		expect(clamp(15, 0, 10)).toBe(10);
		expect(clamp(-5, 0, 10)).toBe(0);
		expect(clamp(5, 0, 10)).toBe(5);
	});

	it('treats a missing bound as unbounded', () => {
		expect(clamp(-100, undefined, 10)).toBe(-100);
		expect(clamp(1e6, 0, undefined)).toBe(1e6);
		expect(clamp(-3)).toBe(-3);
	});

	it('prefers min when the bounds are passed the wrong way round', () => {
		expect(clamp(5, 10, 0)).toBe(10);
	});
});

describe('stepValue', () => {
	it('adds and subtracts the step', () => {
		expect(stepValue({ value: 3, delta: 1, decimals: 0 })).toBe(4);
		expect(stepValue({ value: 3, delta: -1, decimals: 0 })).toBe(2);
	});

	it('stays exact across fractional steps', () => {
		expect(stepValue({ value: 0.1, delta: 0.2, decimals: 1 })).toBe(0.3);
		expect(stepValue({ value: 0.7, delta: 0.1, decimals: 1 })).toBe(0.8);
	});

	it('stops at the bounds', () => {
		expect(stepValue({ value: 10, delta: 1, max: 10, decimals: 0 })).toBe(10);
		expect(stepValue({ value: 0, delta: -1, min: 0, decimals: 0 })).toBe(0);
	});

	it('goes negative when nothing says otherwise', () => {
		expect(stepValue({ value: 0, delta: -1, decimals: 0 })).toBe(-1);
	});

	it('steps an empty field onto the first allowed value, not past it', () => {
		expect(stepValue({ value: undefined, delta: 1, min: 5, decimals: 0 })).toBe(5);
		expect(stepValue({ value: undefined, delta: 1, min: 0, decimals: 0 })).toBe(1);
		expect(stepValue({ value: undefined, delta: -1, decimals: 0 })).toBe(-1);
	});
});

describe('parse', () => {
	it('reads a plain number', () => {
		expect(parse('42', undefined, undefined, 0)).toBe(42);
	});

	it('clamps a typed value that is out of range', () => {
		expect(parse('150', 0, 100, 0)).toBe(100);
		expect(parse('-4', 0, 100, 0)).toBe(0);
	});

	it('rounds to the step precision', () => {
		expect(parse('1.239', 0, 10, 2, 'en-US')).toBe(1.24);
	});

	it('treats an empty field as no value, not as the minimum', () => {
		expect(parse('', 5, 10, 0)).toBeUndefined();
		expect(parse('   ', 5, 10, 0)).toBeUndefined();
	});

	it('treats unparseable input as empty', () => {
		expect(parse('abc', 0, 10, 0)).toBeUndefined();
	});

	it('keeps a negative when the range allows it', () => {
		expect(parse('-40', -100, 100, 0)).toBe(-40);
	});

	it('reads the decimal comma where the locale writes one', () => {
		expect(parse('1,5', undefined, undefined, 1, 'de-DE')).toBe(1.5);
		expect(parse('1,5', undefined, undefined, 1, 'es-CO')).toBe(1.5);
		expect(parse('-0,25', undefined, undefined, 2, 'fr-FR')).toBe(-0.25);
	});

	it("drops the locale's group separator where it groups", () => {
		expect(parse('1,500', undefined, undefined, 0, 'en-US')).toBe(1500);
		expect(parse('1.500,5', undefined, undefined, 1, 'de-DE')).toBe(1500.5);
		expect(parse('1 500,5', undefined, undefined, 1, 'fr-FR')).toBe(1500.5);
		expect(parse('1,234,567', undefined, undefined, 0, 'en-US')).toBe(1234567);
	});

	it('reads a lone separator that cannot be a group as the decimal point', () => {
		expect(parse('1.5', undefined, undefined, 1, 'de-DE')).toBe(1.5);
		expect(parse('1,5', undefined, undefined, 1, 'en-US')).toBe(1.5);
	});

	it('refuses what is not a plain decimal number', () => {
		for (const raw of [',', '.', '-', '1.2.3', '1,5,0', '0x1A', '1e5', 'Infinity', '12abc']) {
			expect(parse(raw, undefined, undefined, 2, 'en-US'), raw).toBeUndefined();
		}
		expect(parse('1.2.3', undefined, undefined, 2, 'de-DE')).toBeUndefined();
	});

	it('reads the digits and the minus sign a locale writes', () => {
		expect(parse('٤٢', undefined, undefined, 0, 'ar-EG')).toBe(42);
		expect(parse('\u221240', -100, 100, 0, 'en-US')).toBe(-40);
	});
});

describe('format', () => {
	it("writes the value with the locale's decimal separator", () => {
		expect(format(1.5, 1, 'de-DE')).toBe('1,5');
		expect(format(1.5, 1, 'en-US')).toBe('1.5');
	});

	it('never groups, and never pads the decimals', () => {
		expect(format(1500.5, 2, 'de-DE')).toBe('1500,5');
		expect(format(3, 2, 'en-US')).toBe('3');
	});

	it('writes nothing for an empty value, and no sign on a zero', () => {
		expect(format(undefined, 0, 'en-US')).toBe('');
		expect(format(-0, 1, 'en-US')).toBe('0');
	});

	it('reads back as the same number', () => {
		for (const locale of ['en-US', 'de-DE', 'fr-FR', 'es-CO', 'ar-EG']) {
			expect(parse(format(-1234.56, 2, locale), undefined, undefined, 2, locale)).toBe(-1234.56);
		}
	});
});
