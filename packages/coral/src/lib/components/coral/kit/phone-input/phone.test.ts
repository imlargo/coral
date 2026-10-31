/**
 * @coral/kit/phone-input
 * @version 1.0.0
 */

import { describe, expect, it } from 'vitest';
import {
	countryOfValue,
	dialCode,
	display,
	matchesDialCode,
	read,
	supportedCountries,
	switchCountry
} from './phone.js';

describe('read', () => {
	it('formats a national number for its country and hands back E.164', () => {
		expect(read('4155550123', 'US')).toEqual({
			text: '(415) 555-0123',
			value: '+14155550123',
			country: 'US',
			valid: true
		});
	});

	it('reports an incomplete number as it stands, and as not valid', () => {
		expect(read('415', 'US')).toMatchObject({ value: '+1415', valid: false });
	});

	it('follows the country an international number names', () => {
		expect(read('+44 20 7946 0958', 'US')).toMatchObject({
			text: '+44 20 7946 0958',
			value: '+442079460958',
			country: 'GB',
			valid: true
		});
	});

	it('keeps a country that shares the calling code until the number tells them apart', () => {
		expect(read('+1 4', 'CA').country).toBe('CA');
		expect(read('+1 4', 'DE').country).toBeUndefined();
	});

	it('writes the plus in when there is no country to be national to', () => {
		expect(read('49', undefined)).toMatchObject({ text: '+49', country: 'DE', value: undefined });
	});

	it('has no value until there is a number past the calling code', () => {
		expect(read('', 'US').value).toBeUndefined();
		expect(read('+', undefined)).toMatchObject({ text: '+', value: undefined });
		expect(read('+1', undefined).value).toBeUndefined();
	});

	it('drops what is not a digit', () => {
		expect(read('415-abc-555', 'US').value).toBe('+1415555');
	});
});

describe('display', () => {
	it('shows a value nationally under its own country and internationally under another', () => {
		expect(display('+442079460958', 'GB')).toBe('020 7946 0958');
		expect(display('+442079460958', 'US')).toBe('+44 20 7946 0958');
		expect(display(undefined, 'US')).toBe('');
	});
});

describe('switchCountry', () => {
	it('reads the digits already typed as a number of the new country', () => {
		expect(switchCountry('020 7946 0958', 'GB', 'US')).toMatchObject({
			value: '+12079460958',
			country: 'US'
		});
		expect(switchCountry('+1 207 946 0958', undefined, 'GB')).toMatchObject({
			text: '020 7946 0958',
			value: '+442079460958',
			country: 'GB'
		});
	});

	it('leaves an empty field empty', () => {
		expect(switchCountry('', 'US', 'DE')).toMatchObject({
			text: '',
			value: undefined,
			country: 'DE'
		});
	});
});

describe('countries and calling codes', () => {
	it('lists every country with a calling code, or only the supported ones asked for', () => {
		expect(supportedCountries()).toContain('US');
		expect(supportedCountries(['DE', 'AQ', 'FR'])).toEqual(['DE', 'FR']);
	});

	it('spells a calling code with its plus', () => {
		expect(dialCode('DE')).toBe('+49');
	});

	it('matches a search typed as a calling code, with or without the plus', () => {
		expect(matchesDialCode('GB', '+44')).toBe(true);
		expect(matchesDialCode('GB', '4')).toBe(true);
		expect(matchesDialCode('GB', '+1')).toBe(false);
		expect(matchesDialCode('GB', 'uk')).toBe(false);
	});

	it('tells the country of a stored value', () => {
		expect(countryOfValue('+4930123456')).toBe('DE');
		expect(countryOfValue(undefined)).toBeUndefined();
	});
});
