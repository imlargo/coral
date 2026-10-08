/**
 * @coral/kit/avatar
 * @version 1.0.1
 */

import { describe, expect, it } from 'vitest';
import { initials } from './initials.js';

describe('initials', () => {
	it('takes the first letter of the first and last words', () => {
		expect(initials('James Lane')).toBe('JL');
	});

	it('skips the middle, so compound names stay two letters', () => {
		expect(initials('Elena van der Meer')).toBe('EM');
	});

	it('returns a single letter for a single-word name', () => {
		expect(initials('Ana')).toBe('A');
	});

	it('preserves accents', () => {
		expect(initials('Åsa Öberg')).toBe('ÅÖ');
	});

	it('keeps an accent typed as a separate mark on its letter', () => {
		// Decomposed is what macOS and some keyboards produce: `E` followed by a combining accent.
		expect(initials('Émile Zola'.normalize('NFD'))).toBe('ÉZ'.normalize('NFD'));
	});

	it('takes a whole emoji, not half of one', () => {
		expect(initials('👩🏽‍💻 Studio')).toBe('👩🏽‍💻S');
		expect(initials('🇯🇵 Team')).toBe('🇯🇵T');
	});

	it('tolerates surrounding and repeated whitespace', () => {
		expect(initials('  james   lane  ')).toBe('JL');
	});

	it('returns an empty string when there is nothing to derive from', () => {
		expect(initials('')).toBe('');
		expect(initials('   ')).toBe('');
		expect(initials(undefined)).toBe('');
		expect(initials(null)).toBe('');
	});
});
