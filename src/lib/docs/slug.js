/**
 * Heading slugs, shared by the two things that must agree on them: `prose.svelte`, which assigns
 * ids to the rendered article, and the build-time docs index behind search, which links to them.
 *
 * Plain JS on purpose - the Vite plugin imports it from Node, outside the TypeScript build.
 */

/**
 * @param {string} text
 * @returns {string}
 */
export function slugify(text) {
	return text
		.toLowerCase()
		.replace(/[^\p{L}\p{N}]+/gu, '-')
		.replace(/^-|-$/g, '');
}

/**
 * Slugifies a list of heading texts in document order, disambiguating repeats the same way on
 * both sides - `Usage`, `Usage-2`, `Usage-3`.
 *
 * @param {string[]} texts
 * @returns {string[]}
 */
export function slugifyAll(texts) {
	/** @type {Record<string, number>} */
	const counts = {};

	return texts.map((text) => {
		const base = slugify(text);
		counts[base] = (counts[base] ?? 0) + 1;
		return counts[base] === 1 ? base : `${base}-${counts[base]}`;
	});
}
