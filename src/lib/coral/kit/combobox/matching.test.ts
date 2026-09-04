/**
 * @coral/kit/combobox
 * @version 4.1.0
 */

import { describe, expect, it } from 'vitest';
import { includesValue, matches, terms } from './matching.js';
import type { Option } from '../../lib/options.js';

const option = (over: Partial<Option<string>> = {}): Option<string> => ({
	value: 'bogota',
	label: 'Bogotá',
	...over
});

describe('terms', () => {
	it('collects label, description and keywords', () => {
		expect(terms(option({ description: 'Cundinamarca', keywords: ['dc', 'capital'] }))).toEqual([
			'Bogotá',
			'Cundinamarca',
			'dc',
			'capital'
		]);
	});

	it('drops absent and empty entries', () => {
		expect(terms(option({ description: '', keywords: [] }))).toEqual(['Bogotá']);
	});
});

describe('matches', () => {
	it('matches an unaccented search against an accented label', () => {
		expect(matches(option(), 'bogota')).toBe(true);
	});

	it('matches on the description', () => {
		expect(matches(option({ description: 'Cundinamarca' }), 'cundi')).toBe(true);
	});

	it('matches on a keyword that is never displayed', () => {
		expect(matches(option({ keywords: ['DC'] }), 'dc')).toBe(true);
	});

	it('rejects a term that appears nowhere', () => {
		expect(matches(option(), 'cali')).toBe(false);
	});

	it('keeps everything for an empty or whitespace-only search', () => {
		expect(matches(option(), '')).toBe(true);
		expect(matches(option(), '   ')).toBe(true);
	});

	it('ignores surrounding whitespace in the search', () => {
		expect(matches(option(), '  bogota  ')).toBe(true);
	});
});

describe('includesValue', () => {
	it('finds a primitive by identity', () => {
		expect(includesValue([1, 2, 3], 2)).toBe(true);
		expect(includesValue([1, 2, 3], 9)).toBe(false);
	});

	it('compares objects by reference, not by shape', () => {
		const a = { id: 1 };
		expect(includesValue([a], a)).toBe(true);
		expect(includesValue([a], { id: 1 })).toBe(false);
	});

	it('handles an empty selection', () => {
		expect(includesValue([], 'x')).toBe(false);
	});
});
