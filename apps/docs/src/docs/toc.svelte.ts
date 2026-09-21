/**
 * Headings of the page currently rendered by `prose.svelte`.
 *
 * The prose layout owns heading ids (it is what walks the rendered article), so it publishes the
 * list here instead of the table of contents re-deriving it from the DOM - which would race with
 * the ids being assigned.
 */

export type Heading = {
	id: string;
	text: string;
	level: 2 | 3;
};

export const toc = $state<{ headings: Heading[] }>({ headings: [] });
