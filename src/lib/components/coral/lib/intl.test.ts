/**
 * @coral/lib/intl
 * @version 1.0.0
 */

import { describe, expect, it } from 'vitest';
import { collator, dateTimeFormat, numberFormat, relativeTimeFormat } from './intl.js';

describe('intl', () => {
	it('hands back the same object for the same locale and options', () => {
		expect(collator('en-US', { numeric: true })).toBe(collator('en-US', { numeric: true }));
		expect(dateTimeFormat('en-US', { month: 'short' })).toBe(
			dateTimeFormat('en-US', { month: 'short' })
		);
		expect(numberFormat('de-DE')).toBe(numberFormat('de-DE'));
		expect(relativeTimeFormat('en-US', { numeric: 'auto' })).toBe(
			relativeTimeFormat('en-US', { numeric: 'auto' })
		);
	});

	it('keeps different locales and options apart', () => {
		expect(numberFormat('en-US')).not.toBe(numberFormat('de-DE'));
		expect(dateTimeFormat('en-US', { month: 'short' })).not.toBe(
			dateTimeFormat('en-US', { month: 'long' })
		);
	});

	it('keeps the four constructors apart even for the same key', () => {
		expect(collator('en-US')).toBeInstanceOf(Intl.Collator);
		expect(numberFormat('en-US')).toBeInstanceOf(Intl.NumberFormat);
	});

	it('builds working formatters, and follows the reader when no locale is given', () => {
		expect(numberFormat('de-DE').format(1.5)).toBe('1,5');
		expect(numberFormat().resolvedOptions().locale).toBe(
			new Intl.NumberFormat().resolvedOptions().locale
		);
	});
});
