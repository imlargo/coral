/**
 * @coral/kit/search-input
 * @version 1.0.0
 */

import { describe, expect, it } from 'vitest';
import { effectiveTerm, hasChanged } from './term.js';

describe('effectiveTerm', () => {
	it('trims', () => {
		expect(effectiveTerm('  açaí ')).toBe('açaí');
	});

	it('reads a blank field as empty', () => {
		expect(effectiveTerm('   ')).toBe('');
	});

	it('reads a term shorter than minLength as empty, not as no search', () => {
		expect(effectiveTerm('a', 2)).toBe('');
		expect(effectiveTerm('ab', 2)).toBe('ab');
	});

	it('does not count surrounding spaces towards minLength', () => {
		expect(effectiveTerm(' a ', 2)).toBe('');
	});

	it('counts code points, not UTF-16 units', () => {
		// One emoji is two UTF-16 units; typed, it is one character.
		expect(effectiveTerm('🌮', 2)).toBe('');
		expect(effectiveTerm('🌮🌮', 2)).toBe('🌮🌮');
	});
});

describe('hasChanged', () => {
	it('is false for the term that was already searched', () => {
		expect(hasChanged('kiwi', 'kiwi')).toBe(false);
	});

	it('is true for anything else, including clearing', () => {
		expect(hasChanged('kiw', 'kiwi')).toBe(true);
		expect(hasChanged('', 'kiwi')).toBe(true);
	});
});
