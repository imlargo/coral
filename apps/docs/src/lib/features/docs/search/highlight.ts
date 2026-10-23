/**
 * Marks which words of a text matched a search, as plain segments the UI renders with `<mark>`.
 *
 * Segments, not an HTML string: the text comes from the docs and is rendered by Svelte as text, so
 * nothing here ever builds markup, and nothing needs escaping.
 */
import { WORD, fold } from './text.ts';

export type Segment = { text: string; match: boolean };

/** Character ranges of the words in `text` whose folded form is in `terms`. */
function ranges(text: string, terms: ReadonlySet<string>): [number, number][] {
	const found: [number, number][] = [];
	for (const word of text.matchAll(WORD)) {
		if (terms.has(fold(word[0]))) found.push([word.index, word.index + word[0].length]);
	}
	return found;
}

function segments(text: string, marked: [number, number][]): Segment[] {
	const out: Segment[] = [];
	let cursor = 0;

	for (const [start, end] of marked) {
		if (start > cursor) out.push({ text: text.slice(cursor, start), match: false });
		out.push({ text: text.slice(start, end), match: true });
		cursor = end;
	}
	if (cursor < text.length) out.push({ text: text.slice(cursor), match: false });

	return out;
}

/** The whole of `text`, with the words in `terms` marked. */
export function highlight(text: string, terms: readonly string[]): Segment[] {
	return segments(text, ranges(text, new Set(terms)));
}

/**
 * A window of `text` around the first matching word, at most about `length` characters, cut at word
 * boundaries and marked with an ellipsis where it stops short. With no match it is the start of the
 * text, which is what a heading-only match wants to show.
 */
export function snippet(text: string, terms: readonly string[], length = 140): Segment[] {
	const wanted = new Set(terms);
	if (text.length <= length) return segments(text, ranges(text, wanted));

	const first = ranges(text, wanted)[0];

	// A little context to the left: a snippet that opens on the match reads as if it was cut there.
	let start = first ? Math.max(0, first[0] - 40) : 0;
	if (start > 0) {
		const boundary = text.indexOf(' ', start);
		if (boundary !== -1 && boundary - start < 20) start = boundary + 1;
	}

	let end = Math.min(text.length, start + length);
	if (end < text.length) {
		const boundary = text.lastIndexOf(' ', end);
		if (boundary > start + length / 2) end = boundary;
	}

	const window = text.slice(start, end);
	const out = segments(window, ranges(window, wanted));

	if (start > 0) out.unshift({ text: '…', match: false });
	if (end < text.length) out.push({ text: '…', match: false });
	return out;
}
