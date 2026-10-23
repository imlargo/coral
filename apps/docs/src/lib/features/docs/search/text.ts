/** A word as the search sees it: letters and digits. Everything else - space, punctuation, `_` - separates. */
export const WORD = /[\p{L}\p{N}]+/gu;

/**
 * Folds a string into the form searches compare against: lower case, no accents, so `instalación`
 * is found by `instalacion`. NFD splits an accented letter into its base plus a combining mark, and
 * dropping the marks leaves the letter.
 *
 * Fold a word at a time, never a whole text: NFD can change a string's length, and the highlighter
 * needs the offsets of the words it folds to still point into the original.
 */
export function fold(value: string): string {
	return value
		.normalize('NFD')
		.replace(/\p{Diacritic}/gu, '')
		.toLocaleLowerCase();
}

/** Every word of `text`, folded. */
export function tokenize(text: string): string[] {
	return (text.match(WORD) ?? []).map(fold);
}

/** Too common to tell one page from another, so they are dropped from a query - "how to install" is a search for "install". */
const STOP_WORDS = new Set([
	'a',
	'an',
	'and',
	'are',
	'as',
	'at',
	'be',
	'by',
	'for',
	'from',
	'how',
	'in',
	'is',
	'it',
	'of',
	'on',
	'or',
	'that',
	'the',
	'this',
	'to',
	'with'
]);

/**
 * The terms a query is made of. Stop words are dropped unless that would leave nothing, so
 * searching for "to" still finds something instead of an empty list.
 */
export function queryTerms(query: string): string[] {
	const terms = tokenize(query);
	const meaningful = terms.filter((term) => !STOP_WORDS.has(term));
	return meaningful.length > 0 ? meaningful : terms;
}
