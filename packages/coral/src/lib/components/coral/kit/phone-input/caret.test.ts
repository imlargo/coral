/**
 * @coral/kit/phone-input
 * @version 1.0.0
 */

import { describe, expect, it } from 'vitest';
import { deleteDigit, indexAfter, significantBefore } from './caret.js';

describe('caret', () => {
	it('counts the digits and the plus before an index', () => {
		expect(significantBefore('(415) 555', 6)).toBe(3);
		expect(significantBefore('+44 20', 4)).toBe(3);
	});

	it('finds the index after a count of them, skipping what the formatter wrote', () => {
		expect(indexAfter('(415) 555-0123', 3)).toBe(4);
		expect(indexAfter('(415) 555-0123', 4)).toBe(7);
		expect(indexAfter('(415) 555-0123', 0)).toBe(0);
		expect(indexAfter('415', 9)).toBe(3);
	});

	it('deletes the digit beside a formatting character, on the side the key points to', () => {
		// Backspace right after the `-` in `555-0123`, which the browser already removed.
		expect(deleteDigit('(415) 5550123', 9, 'backward')).toEqual({ text: '(415) 550123', caret: 8 });
		expect(deleteDigit('(415)555-0123', 5, 'forward')).toEqual({ text: '(415)55-0123', caret: 5 });
		expect(deleteDigit('()', 1, 'backward')).toEqual({ text: '()', caret: 1 });
	});
});
