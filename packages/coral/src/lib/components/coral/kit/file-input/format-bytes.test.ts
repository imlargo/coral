/**
 * @coral/kit/file-input
 * @version 1.1.1
 */

import { describe, expect, it } from 'vitest';
import { formatBytes } from './format-bytes.js';

describe('formatBytes', () => {
	it('leaves bytes whole', () => {
		expect(formatBytes(1)).toBe('1 B');
		expect(formatBytes(1023)).toBe('1023 B');
	});

	it('steps by 1024', () => {
		expect(formatBytes(1024)).toBe('1 KB');
		expect(formatBytes(1024 * 1024)).toBe('1 MB');
		expect(formatBytes(1024 ** 3)).toBe('1 GB');
		expect(formatBytes(1024 ** 4)).toBe('1 TB');
	});

	it('takes the decimal separator from the locale, which `toFixed` cannot', () => {
		expect(formatBytes(1024 * 1024 * 1.5, 'en-US')).toBe('1.5 MB');
		expect(formatBytes(1024 * 1024 * 1.5, 'de-DE')).toBe('1,5 MB');
	});

	it('follows the reader’s own locale when none is given', () => {
		// Not pinned to a locale chosen when this was written: whatever `Intl` does here is what the
		// reader sees, and that is the whole point of not reaching for `toFixed`.
		const expected = (1.5).toLocaleString(undefined, { maximumFractionDigits: 1 });
		expect(formatBytes(1024 * 1024 * 1.5)).toBe(`${expected} MB`);
	});

	it('keeps one decimal at most', () => {
		expect(formatBytes(1024 * 740)).toBe('740 KB');
		expect(formatBytes(5 * 1024 * 1024)).toBe('5 MB');
	});

	it('moves up a unit rather than printing a full 1024 of the smaller one', () => {
		expect(formatBytes(1024 * 1024 - 1)).toBe('1 MB');
	});

	it('stays in the largest unit it knows', () => {
		expect(formatBytes(1024 ** 6)).toMatch(/TB$/);
	});

	it('reads nothing, negative and unusable sizes as zero', () => {
		expect(formatBytes(0)).toBe('0 B');
		expect(formatBytes(-5)).toBe('0 B');
		expect(formatBytes(Number.NaN)).toBe('0 B');
		expect(formatBytes(Number.POSITIVE_INFINITY)).toBe('0 B');
	});
});
