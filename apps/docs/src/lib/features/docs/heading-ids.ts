import { slug, uniqueId } from '#lib/components/coral/kit/toc/headings.ts';

/** Ids that already exist on every page, so a heading must never take one. */
const RESERVED = ['main-content'];

/**
 * Hands out one anchor per heading, in document order.
 *
 * The rehype plugin that writes the ids into the page and the extractor that builds the search index
 * both walk a page's headings in order and call this, which is the whole guarantee that a search
 * result's `#anchor` is the id the heading really has. The slug rules are the table of contents',
 * so an id assigned here is the one it would have invented itself.
 */
export function createHeadingIds(): (text: string) => string {
	const taken = new Set(RESERVED);

	return (text) => {
		// A heading made only of an expression has no text to name it by; it gets no anchor.
		if (!text.trim()) return '';
		const id = uniqueId(slug(text), taken);
		taken.add(id);
		return id;
	};
}
