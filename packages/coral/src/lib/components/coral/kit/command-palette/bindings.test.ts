/**
 * @coral/kit/command-palette
 * @version 1.0.0
 */

import { describe, expect, it } from 'vitest';
import { swallowsVimKey } from './bindings.js';

describe('swallowsVimKey', () => {
	it('sees `mod+k` as Control+K off a Mac, and as Command+K on one', () => {
		expect(swallowsVimKey(['mod+k'], 'other')).toBe(true);
		expect(swallowsVimKey(['mod+k'], 'mac')).toBe(false);
	});

	it('only cares about Control on its own', () => {
		expect(swallowsVimKey(['ctrl+shift+k'], 'other')).toBe(true);
		expect(swallowsVimKey(['ctrl+alt+k'], 'other')).toBe(false);
		expect(swallowsVimKey(['meta+k'], 'other')).toBe(false);
	});

	it('leaves keys the primitive does not read alone', () => {
		expect(swallowsVimKey(['mod+o', 'mod+shift+o', 'mod+enter'], 'other')).toBe(false);
	});

	it('looks at every combo, and skips the ones that are not there', () => {
		expect(swallowsVimKey(['mod+o', undefined, '', 'ctrl+j'], 'other')).toBe(true);
		expect(swallowsVimKey([], 'other')).toBe(false);
	});
});
