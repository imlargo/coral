/**
 * @coral/kit/combobox
 * @version 4.0.0
 */

import { describe, expect, it } from 'vitest';
import { fold } from './fold.js';

describe('fold', () => {
	it('lowercases', () => {
		expect(fold('Bogotá')).toBe('bogota');
	});

	it('strips accents, so the unaccented spelling matches', () => {
		expect(fold('Medellín')).toBe('medellin');
		expect(fold('Chocó')).toBe('choco');
	});

	it('folds ñ to n, which is what people type when searching', () => {
		expect(fold('Muñoz')).toBe('munoz');
	});

	it('folds diaeresis', () => {
		expect(fold('Camargüey')).toBe('camarguey');
	});

	it('leaves unaccented text alone apart from case', () => {
		expect(fold('Cali')).toBe('cali');
	});

	it('handles the empty string', () => {
		expect(fold('')).toBe('');
	});

	it('makes a folded search a substring of a folded label', () => {
		expect(fold('Bogotá, Cundinamarca').includes(fold('bogota'))).toBe(true);
	});
});
