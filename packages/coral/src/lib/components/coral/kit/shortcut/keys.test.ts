/**
 * @coral/kit/shortcut
 * @version 1.0.0
 */

import { describe, expect, it } from 'vitest';
import { ariaKeyshortcuts, isPlain, matches, parse, tokens } from './keys.js';

/** Just enough of a `KeyboardEvent` for `matches`, without a DOM. */
function press(
	key: string,
	modifiers: Partial<Record<'ctrlKey' | 'metaKey' | 'altKey' | 'shiftKey', boolean>> = {},
	code = ''
): KeyboardEvent {
	return {
		key,
		code,
		ctrlKey: false,
		metaKey: false,
		altKey: false,
		shiftKey: false,
		...modifiers
	} as KeyboardEvent;
}

describe('parse', () => {
	it('resolves mod to Command on a Mac and Control elsewhere', () => {
		expect(parse('mod+k', 'mac')).toMatchObject({ key: 'k', meta: true, ctrl: false });
		expect(parse('mod+k', 'other')).toMatchObject({ key: 'k', meta: false, ctrl: true });
	});

	it('is case- and space-insensitive', () => {
		expect(parse(' Ctrl + Shift + P ', 'other')).toEqual({
			key: 'p',
			ctrl: true,
			meta: false,
			alt: false,
			shift: true
		});
	});

	it('understands the usual aliases', () => {
		expect(parse('cmd+opt+esc', 'mac')).toMatchObject({ key: 'escape', meta: true, alt: true });
		expect(parse('up', 'other').key).toBe('arrowup');
		expect(parse('space', 'other').key).toBe(' ');
	});

	it('reads the plus key, written either way', () => {
		expect(parse('ctrl+plus', 'other')).toMatchObject({ key: '+', ctrl: true });
		expect(parse('ctrl++', 'other')).toMatchObject({ key: '+', ctrl: true });
	});
});

describe('tokens', () => {
	it('draws Mac modifiers as symbols, in Apple order', () => {
		const combo = parse('shift+mod+alt+ctrl+k', 'mac');
		expect(tokens(combo, 'mac').map((token) => token.symbol)).toEqual(['⌃', '⌥', '⇧', '⌘', 'K']);
	});

	it('draws modifiers as words elsewhere, Ctrl first', () => {
		const combo = parse('shift+mod+k', 'other');
		expect(tokens(combo, 'other').map((token) => token.symbol)).toEqual(['Ctrl', 'Shift', 'K']);
	});

	it('names every symbol for a screen reader', () => {
		const combo = parse('mod+enter', 'mac');
		expect(tokens(combo, 'mac').map((token) => token.name)).toEqual(['Command', 'Enter']);
	});

	it('capitalizes a function key', () => {
		expect(tokens(parse('f5', 'other'), 'other')[0].symbol).toBe('F5');
	});
});

describe('ariaKeyshortcuts', () => {
	it('uses the attribute’s own modifier names', () => {
		expect(ariaKeyshortcuts(parse('mod+shift+k', 'mac'))).toBe('Shift+Meta+K');
		expect(ariaKeyshortcuts(parse('mod+shift+k', 'other'))).toBe('Control+Shift+K');
	});

	it('spells out named keys', () => {
		expect(ariaKeyshortcuts(parse('alt+up', 'other'))).toBe('Alt+ArrowUp');
		expect(ariaKeyshortcuts(parse('space', 'other'))).toBe('Space');
	});
});

describe('matches', () => {
	it('matches the combo exactly', () => {
		const combo = parse('mod+k', 'other');
		expect(matches(press('k', { ctrlKey: true }), combo)).toBe(true);
	});

	it('refuses an extra modifier', () => {
		const combo = parse('mod+k', 'other');
		expect(matches(press('K', { ctrlKey: true, shiftKey: true }), combo)).toBe(false);
		expect(matches(press('k', { ctrlKey: true, altKey: true }), combo)).toBe(false);
	});

	it('refuses a missing modifier', () => {
		expect(matches(press('k'), parse('mod+k', 'other'))).toBe(false);
	});

	it('ignores letter case, which Shift and Caps Lock change', () => {
		expect(matches(press('K', { shiftKey: true }), parse('shift+k', 'other'))).toBe(true);
	});

	it('does not demand Shift for a symbol that needs it to be typed', () => {
		// `?` is Shift+/ on a US layout. Nobody writes `shift+?`.
		expect(matches(press('?', { shiftKey: true }), parse('?', 'other'))).toBe(true);
	});

	it('falls back to the physical key when Option rewrites the character', () => {
		// Option+K on a Mac produces `˚`.
		expect(matches(press('˚', { altKey: true }, 'KeyK'), parse('alt+k', 'mac'))).toBe(true);
	});

	it('follows the layout, not the physical key, without Option', () => {
		// On AZERTY the key labelled A sits where QWERTY has Q.
		expect(matches(press('a', { ctrlKey: true }, 'KeyQ'), parse('ctrl+a', 'other'))).toBe(true);
		expect(matches(press('a', { ctrlKey: true }, 'KeyQ'), parse('ctrl+q', 'other'))).toBe(false);
	});

	it('never matches a combo with no key', () => {
		expect(matches(press('Control', { ctrlKey: true }), parse('ctrl', 'other'))).toBe(false);
	});
});

describe('isPlain', () => {
	it('is true for combos that are also typed characters', () => {
		expect(isPlain(parse('/', 'other'))).toBe(true);
		expect(isPlain(parse('shift+?', 'other'))).toBe(true);
	});

	it('is false once Control, Command or Alt is held', () => {
		expect(isPlain(parse('mod+k', 'mac'))).toBe(false);
		expect(isPlain(parse('alt+n', 'other'))).toBe(false);
	});
});
