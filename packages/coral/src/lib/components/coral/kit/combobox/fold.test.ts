/**
 * @coral/kit/combobox
 * @version 4.2.0
 */

import { describe, expect, it } from 'vitest';
import { fold } from './fold.js';

describe('fold', () => {
	it('lowercases', () => {
		expect(fold('Açaí')).toBe('acai');
	});

	it('strips accents, so the unaccented spelling matches', () => {
		expect(fold('Café')).toBe('cafe');
		expect(fold('Crème')).toBe('creme');
	});

	it('folds ñ to n, which is what people type when searching', () => {
		expect(fold('Piña')).toBe('pina');
	});

	it('folds diaeresis', () => {
		expect(fold('Naïve')).toBe('naive');
	});

	it('leaves unaccented text alone apart from case', () => {
		expect(fold('Kiwi')).toBe('kiwi');
	});

	it('handles the empty string', () => {
		expect(fold('')).toBe('');
	});

	it('makes a folded search a substring of a folded label', () => {
		expect(fold('Açaí, Tropical').includes(fold('acai'))).toBe(true);
	});
});
