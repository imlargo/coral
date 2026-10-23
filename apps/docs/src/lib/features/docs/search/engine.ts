/**
 * The search itself: score sections against a query, then group what matched by page.
 *
 * Small on purpose. Docs are a few hundred sections, so every keystroke can afford to look at all of
 * them, and what a docs search needs is not much: a heading that names the thing outranks a body
 * that mentions it, a half-typed last word still matches, accents do not matter, and a query with
 * one unknown word does not come back empty. No typo tolerance - a wrong letter finds nothing - which
 * is the price of not shipping a search library; past a few thousand pages, reach for one.
 */
import { queryTerms, tokenize } from './text.ts';
import type { SearchSection } from './types.ts';

type Field = 'title' | 'heading' | 'text';

/** What a match in each field is worth: a page or heading named after the thing beats body text mentioning it. */
const WEIGHT: Record<Field, number> = { title: 8, heading: 5, text: 1 };

/** Extra for the whole query appearing as consecutive words - "clone and install" over three scattered words. */
const PHRASE_BONUS: Record<Field, number> = { title: 6, heading: 4, text: 2 };

/** A word that merely starts with the term is a weaker match than the term itself. */
const PREFIX_FACTOR = 0.6;

/** A term repeated in a field counts for more, but with diminishing returns: past this it is just a long section. */
const MAX_COUNTED_REPEATS = 5;

/** Prefixes shorter than this match too much to mean anything: `a` is the start of half the words. */
const MIN_PREFIX_LENGTH = 2;

export type Hit = {
	section: SearchSection;
	score: number;
	/** The folded words in the section that matched, for the highlighter. */
	matched: string[];
};

export type PageResult = {
	href: string;
	pageTitle: string;
	group: string;
	hits: Hit[];
};

export type SearchOptions = {
	maxPages?: number;
	maxHitsPerPage?: number;
};

/** Every page, under the sidebar group it is listed in - what to show before anything is typed. */
export type BrowseGroup = {
	title: string;
	pages: { href: string; title: string }[];
};

export type SearchEngine = {
	search(query: string): PageResult[];
	browse(): BrowseGroup[];
};

type Indexed = {
	section: SearchSection;
	tokens: Record<Field, string[]>;
	/** Each field's words joined by single spaces, which is what a phrase is looked for in. */
	joined: Record<Field, string>;
};

function index(section: SearchSection): Indexed {
	// Only a page's own entry is found by the page title. Otherwise every section of a page called
	// "Installation" would match a search for "installation" on the strength of its page alone.
	const tokens = {
		title: section.level === 0 ? tokenize(section.pageTitle) : [],
		heading: tokenize(section.heading),
		text: tokenize(section.text)
	};
	return {
		section,
		tokens,
		joined: {
			title: tokens.title.join(' '),
			heading: tokens.heading.join(' '),
			text: tokens.text.join(' ')
		}
	};
}

/** Words matching `term`, and how much that is worth: exact words count in full, prefixes less. */
function matchTerm(tokens: string[], term: string): { score: number; words: string[] } {
	let exact = 0;
	let prefix = 0;
	const words = new Set<string>();

	for (const token of tokens) {
		if (token === term) {
			exact++;
			words.add(token);
		} else if (term.length >= MIN_PREFIX_LENGTH && token.startsWith(term)) {
			prefix++;
			words.add(token);
		}
	}

	const repeats = (count: number) => 1 + 0.3 * (Math.min(count, MAX_COUNTED_REPEATS) - 1);
	const score = exact > 0 ? repeats(exact) : prefix > 0 ? repeats(prefix) * PREFIX_FACTOR : 0;
	return { score, words: [...words] };
}

type Scored = { indexed: Indexed; score: number; termsMatched: number; matched: string[] };

function scoreSection(indexed: Indexed, terms: string[]): Scored {
	const matched = new Set<string>();
	let score = 0;
	let termsMatched = 0;

	for (const term of terms) {
		let found = false;
		for (const field of Object.keys(WEIGHT) as Field[]) {
			const result = matchTerm(indexed.tokens[field], term);
			if (result.score === 0) continue;
			score += WEIGHT[field] * result.score;
			result.words.forEach((word) => matched.add(word));
			found = true;
		}
		if (found) termsMatched++;
	}

	if (terms.length > 1) {
		// The last word may still be half typed, so the phrase is anchored at its start only.
		const phrase = terms.join(' ');
		for (const field of Object.keys(WEIGHT) as Field[]) {
			if (` ${indexed.joined[field]}`.includes(` ${phrase}`)) score += PHRASE_BONUS[field];
		}
	}

	return { indexed, score, termsMatched, matched: [...matched] };
}

export function createEngine(
	sections: readonly SearchSection[],
	{ maxPages = 8, maxHitsPerPage = 4 }: SearchOptions = {}
): SearchEngine {
	const documents = sections.map(index);

	// Groups in the order their first page appears, which is the sidebar's order.
	const groups = new Map<string, BrowseGroup>();
	for (const { section } of documents) {
		if (section.level !== 0) continue;
		let group = groups.get(section.group);
		if (!group) {
			group = { title: section.group, pages: [] };
			groups.set(section.group, group);
		}
		group.pages.push({ href: section.href, title: section.pageTitle });
	}
	const browse = [...groups.values()];

	return {
		browse: () => browse,

		search(query) {
			const terms = queryTerms(query);
			if (terms.length === 0) return [];

			const scored = documents
				.map((document) => scoreSection(document, terms))
				.filter((entry) => entry.termsMatched > 0);

			// Sections holding every word come first and alone. Only when nothing does, fall back to
			// the ones holding some, most words first - one unknown word should not empty the list.
			const complete = scored.filter((entry) => entry.termsMatched === terms.length);
			const pool = (complete.length > 0 ? complete : scored).sort(
				(a, b) => b.termsMatched - a.termsMatched || b.score - a.score
			);

			// Pages in the order their best section ranks, and each page's sections in rank order too:
			// the first result is the best match, wherever in its page that is, so Enter lands on it.
			const pages = new Map<string, PageResult>();
			for (const { indexed, score, matched } of pool) {
				const { section } = indexed;
				let page = pages.get(section.href);
				if (!page) {
					page = {
						href: section.href,
						pageTitle: section.pageTitle,
						group: section.group,
						hits: []
					};
					pages.set(section.href, page);
				}
				page.hits.push({ section, score, matched });
			}

			return [...pages.values()]
				.slice(0, maxPages)
				.map((page) => ({ ...page, hits: page.hits.slice(0, maxHitsPerPage) }));
		}
	};
}
