/**
 * @coral/kit/country-select
 * @version 1.0.0
 */

import { describe, expect, it } from 'vitest';
import { COUNTRIES, countryOptions, flag } from './countries.js';

describe('COUNTRIES', () => {
	it('holds each of the 249 codes once', () => {
		expect(new Set(COUNTRIES).size).toBe(249);
		expect(COUNTRIES).toHaveLength(249);
	});

	it('holds only codes the platform can name', () => {
		const names = new Intl.DisplayNames('en', { type: 'region', fallback: 'none' });
		expect(COUNTRIES.filter((code) => names.of(code) === undefined)).toEqual([]);
	});
});

describe('flag', () => {
	it('spells the code in regional indicator symbols', () => {
		expect(flag('de')).toBe('🇩🇪');
		expect(flag('US')).toBe('🇺🇸');
	});
});

describe('countryOptions', () => {
	it('names and sorts the countries in the locale', () => {
		const options = countryOptions(['DE', 'AT', 'CH'], 'de-DE');
		expect(options.map((option) => option.label)).toEqual(['Deutschland', 'Österreich', 'Schweiz']);
	});

	it('keeps the code and the English name searchable', () => {
		const [germany] = countryOptions(['DE'], 'de-DE');
		expect(germany.keywords).toEqual(['DE', 'Germany']);

		const [us] = countryOptions(['US'], 'en-US');
		expect(us.keywords).toEqual(['US']);
	});
});
