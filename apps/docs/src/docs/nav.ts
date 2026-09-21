/**
 * Sidebar structure. "Getting started" and "Blocks" are hand-ordered and barely change - three
 * items is not worth deriving. "Kit" is the section that actually grows with every new component,
 * so it comes from the docs collection itself: add `kit/<name>/index.md` and it appears here,
 * titled and sorted, with no second place to update.
 */

import { resolve } from '$app/paths';
import type { ResolvedPathname } from '$app/types';
import { getCollection, type DocsFrontmatter } from './content.js';

export type DocLink = {
	title: string;
	href: ResolvedPathname;
};

export type DocSection = {
	title: string;
	items: DocLink[];
	/** Shown in place of the list while the section is still empty. */
	empty?: string;
};

const KIT_PREFIX = 'kit/';

const kit: DocLink[] = getCollection('docs', (entry) => entry.slug.startsWith(KIT_PREFIX))
	.map((entry) => ({
		title: (entry.data as unknown as DocsFrontmatter).title,
		href: resolve(`/docs/${entry.slug}`)
	}))
	.sort((a, b) => a.title.localeCompare(b.title));

// Routes are resolved here rather than at each `<a>`, so a page that gets moved or renamed fails
// type-checking in one place instead of turning into a dead link.
export const nav: DocSection[] = [
	{
		title: 'Getting started',
		items: [
			{ title: 'Introduction', href: resolve('/docs') },
			{ title: 'Installation', href: resolve('/docs/installation') },
			{ title: 'Conventions', href: resolve('/docs/conventions') }
		]
	},
	{
		title: 'Kit',
		items: kit
	},
	{
		title: 'Blocks',
		items: [],
		empty: 'Empty until the same composition shows up in three projects.'
	}
];

/** The flat, ordered list of pages - drives the prev/next footer. */
export const pages: DocLink[] = nav.flatMap((section) => section.items);
