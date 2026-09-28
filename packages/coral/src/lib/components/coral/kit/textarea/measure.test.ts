/**
 * @coral/kit/textarea
 * @version 1.0.0
 */

import { describe, expect, it } from 'vitest';
import { countOf, heightFor, remaining } from './measure.js';

/** A field with 20px lines, 8px of padding on each side and a 1px border. */
const base = {
	lineHeight: 20,
	padding: 16,
	border: 2,
	borderBox: true,
	minRows: 2
};

describe('heightFor', () => {
	it('sits at the minimum while the text fits in it', () => {
		// Two lines of content: 2 * 20 + 16 padding = 56, plus the 2px border.
		expect(heightFor({ ...base, scrollHeight: 56 })).toEqual({ height: 58, scrollable: false });
	});

	it('grows with the content', () => {
		expect(heightFor({ ...base, scrollHeight: 96 }).height).toBe(98);
	});

	it('never goes below the minimum, whatever the content says', () => {
		expect(heightFor({ ...base, scrollHeight: 20 }).height).toBe(58);
	});

	it('stops at the maximum and scrolls from there', () => {
		// Four rows: 4 * 20 + 16 + 2 = 98.
		const tall = heightFor({ ...base, maxRows: 4, scrollHeight: 300 });
		expect(tall).toEqual({ height: 98, scrollable: true });
	});

	it('does not call a field scrollable for a rounding error', () => {
		expect(heightFor({ ...base, maxRows: 4, scrollHeight: 97 }).scrollable).toBe(false);
	});

	it('adds the border back in a border box, and takes padding out of a content box', () => {
		expect(heightFor({ ...base, scrollHeight: 96 }).height).toBe(98);
		expect(heightFor({ ...base, borderBox: false, scrollHeight: 96 }).height).toBe(80);
	});

	it('grows without limit when no maximum is given', () => {
		expect(heightFor({ ...base, scrollHeight: 2_000 })).toEqual({
			height: 2_002,
			scrollable: false
		});
	});

	it('treats a minimum below one row as one row', () => {
		expect(heightFor({ ...base, minRows: 0, scrollHeight: 10 }).height).toBe(38);
	});
});

describe('counting', () => {
	it('counts what maxlength counts, so the field and the counter agree', () => {
		expect(countOf('hello')).toBe(5);
		// One emoji is two UTF-16 units, and the browser spends two of its limit on it.
		expect(countOf('🚀')).toBe(2);
	});

	it('reports what is left', () => {
		expect(remaining('hello', 10)).toBe(5);
		expect(remaining('', 10)).toBe(10);
	});

	it('never goes negative, for text pasted in before a limit was set', () => {
		expect(remaining('too long already', 4)).toBe(0);
	});
});
