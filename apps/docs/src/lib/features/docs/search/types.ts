/**
 * One searchable piece of a docs page: the page's own summary (its title, description and the text
 * before its first heading), or one section under a heading.
 *
 * Sections rather than whole pages so a result can say *where* in a page the words are, and link
 * straight to it.
 */
export type SearchSection = {
	/** `href` for the page's own entry, `href#anchor` for a section. Unique across the index. */
	id: string;
	href: string;
	/** The section heading's id. Empty for the page's own entry. */
	anchor: string;
	pageTitle: string;
	/** The sidebar group the page is listed under. */
	group: string;
	/** Empty for the page's own entry. */
	heading: string;
	/** `0` for the page's own entry, otherwise the heading level. */
	level: number;
	/** Plain text: Markdown syntax stripped, code kept. */
	text: string;
};
