/**
 * @coral/kit/gauge
 * @version 1.0.0
 */

import { describe, expect, it } from 'vitest';
import { readingText } from './reading.js';

const percent = new Intl.NumberFormat('en-US', { style: 'percent' });
const whole = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });

describe('readingText', () => {
	it('writes the value the ordinary way inside the range', () => {
		expect(readingText(percent, 0.42, 0, 1)).toBe('42%');
		expect(readingText(whole, 72.4, 0, 100)).toBe('72');
	});

	it('never says full before the reading is', () => {
		expect(readingText(percent, 0.996, 0, 1)).toBe('99%');
		expect(readingText(whole, 99.7, 0, 100)).toBe('99');
	});

	it('never says empty while there is something there', () => {
		expect(readingText(percent, 0.003, 0, 1)).toBe('1%');
		expect(readingText(whole, 0.2, 0, 100)).toBe('1');
	});

	it('writes the bounds themselves, and past them, as they are', () => {
		expect(readingText(percent, 1, 0, 1)).toBe('100%');
		expect(readingText(percent, 0, 0, 1)).toBe('0%');
		expect(readingText(whole, 130, 0, 100)).toBe('130');
	});

	it('leaves alone a range too narrow to have a step inside it', () => {
		expect(readingText(whole, 0.7, 0, 1)).toBe('1');
	});

	it('finds the one step inside a range two steps wide', () => {
		expect(readingText(whole, 1.7, 0, 2)).toBe('1');
	});

	it('never prints a negative zero for a reading just under an empty bound', () => {
		expect(readingText(whole, -0.2, -100, 0)).toBe('-1');
	});

	it('leaves alone formats with no fixed decimals', () => {
		const compact = new Intl.NumberFormat('en-US', { notation: 'compact' });
		expect(readingText(compact, 999_900, 0, 1_000_000)).toBe('1M');
	});
});
