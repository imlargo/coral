/**
 * @coral/kit/avatar
 * @version 1.0.0
 */

import { describe, expect, it } from 'vitest';
import { initials } from './initials.js';

describe('initials', () => {
	it('takes the first letter of the first and last words', () => {
		expect(initials('Juan Largo')).toBe('JL');
	});

	it('skips the middle, so compound names stay two letters', () => {
		expect(initials('María del Carmen García')).toBe('MG');
	});

	it('returns a single letter for a single-word name', () => {
		expect(initials('Ana')).toBe('A');
	});

	it('preserves accents', () => {
		expect(initials('Ángela Ñuñez')).toBe('ÁÑ');
	});

	it('tolerates surrounding and repeated whitespace', () => {
		expect(initials('  juan   largo  ')).toBe('JL');
	});

	it('returns an empty string when there is nothing to derive from', () => {
		expect(initials('')).toBe('');
		expect(initials('   ')).toBe('');
		expect(initials(undefined)).toBe('');
		expect(initials(null)).toBe('');
	});
});
