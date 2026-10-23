import { describe, expect, it } from 'vitest';
import { highlight, snippet } from './highlight.ts';

const marked = (segments: { text: string; match: boolean }[]) =>
	segments.filter((segment) => segment.match).map((segment) => segment.text);
const joined = (segments: { text: string }[]) => segments.map((segment) => segment.text).join('');

describe('highlight', () => {
	it('marks whole words, and keeps the text exactly', () => {
		const text = 'Clone the repository, then install it.';
		const segments = highlight(text, ['install', 'clone']);

		expect(marked(segments)).toEqual(['Clone', 'install']);
		expect(joined(segments)).toBe(text);
	});

	it('matches without regard to case or accents, and keeps the original spelling', () => {
		const segments = highlight('Guía de INSTALACIÓN', ['guia', 'instalacion']);
		expect(marked(segments)).toEqual(['Guía', 'INSTALACIÓN']);
	});

	it('leaves offsets right when a word changes length as it folds', () => {
		// "ﬁ" style ligatures and precomposed accents fold to a different number of characters.
		const text = 'Crème brûlée and crème fraîche';
		const segments = highlight(text, ['creme']);
		expect(joined(segments)).toBe(text);
		expect(marked(segments)).toEqual(['Crème', 'crème']);
	});

	it('does not mark a word that only contains a term', () => {
		expect(marked(highlight('reinstall install', ['install']))).toEqual(['install']);
	});

	it('marks nothing when nothing matched', () => {
		expect(highlight('Nothing here', ['zzz'])).toEqual([{ text: 'Nothing here', match: false }]);
	});
});

describe('snippet', () => {
	const long =
		'Lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. ' +
		'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. ' +
		'The installation step comes here, in the middle of a long paragraph. ' +
		'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.';

	it('returns short text whole, without ellipses', () => {
		const segments = snippet('A short line about install.', ['install']);
		expect(joined(segments)).toBe('A short line about install.');
	});

	it('windows a long text around the first match, with ellipses where it stops short', () => {
		const segments = snippet(long, ['installation']);
		const text = joined(segments);

		expect(marked(segments)).toEqual(['installation']);
		expect(text.startsWith('…')).toBe(true);
		expect(text.endsWith('…')).toBe(true);
		expect(text.length).toBeLessThanOrEqual(140 + 2);
	});

	it('cuts at word boundaries, never through a word', () => {
		const words = new Set(long.match(/[\p{L}\p{N}]+/gu));
		const text = joined(snippet(long, ['installation'])).replace(/…/g, '');
		for (const word of text.match(/[\p{L}\p{N}]+/gu) ?? []) expect(words.has(word)).toBe(true);
	});

	it('shows the start of the text when nothing in it matched', () => {
		const text = joined(snippet(long, ['zzz']));
		expect(text.startsWith('Lorem ipsum')).toBe(true);
		expect(text.endsWith('…')).toBe(true);
	});
});
