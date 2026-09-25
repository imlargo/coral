/**
 * Sidebar structure, consumed by svdocs's own `docs-sidebar.svelte` / `docs-breadcrumbs.svelte` /
 * `docs-page-footer.svelte` unchanged. "Getting started" is hand-ordered and barely changes - three
 * items is not worth deriving. "Kit" is the section that actually grows with every new component,
 * so it comes from the docs collection itself: add `kit/<name>/index.md` and it appears here,
 * titled and sorted, with no second place to update. "Blocks" is an empty group for now - nothing
 * lives there yet, per the repo's rule of three.
 */

import { getCollection, type DocsFrontmatter } from '$docs/content/docs.js';

export interface SidebarLink {
	title: string;
	href: string;
}

export interface SidebarGroup {
	title: string;
	items: SidebarLink[];
}

const KIT_PREFIX = 'kit/';

// Plain pathnames, not run through `resolve()` here: with `(docs)` as a route group, `resolve()`'s
// typed overload wants either a literal `RouteId` (which, for a group, is spelled with the
// parens - not the real URL) or a value already typed `Pathname`. The consumers below already
// carry these through `resolve(item.href as Pathname)`, so building plain strings here and
// resolving them at the point of use is what lets a page keep the URL it actually has.
const kit: SidebarLink[] = getCollection('docs', (entry) => entry.slug.startsWith(KIT_PREFIX))
	.map((entry) => ({
		title: (entry.data as unknown as DocsFrontmatter).title,
		href: `/docs/${entry.slug}`
	}))
	.sort((a, b) => a.title.localeCompare(b.title));

export const DOCS_SIDEBAR_GROUPS: SidebarGroup[] = [
	{
		title: 'Getting started',
		items: [
			{ title: 'Introduction', href: '/docs' },
			{ title: 'Installation', href: '/docs/installation' },
			{ title: 'Conventions', href: '/docs/conventions' }
		]
	},
	{
		title: 'Kit',
		items: kit
	},
	{
		title: 'Blocks',
		items: []
	}
];

/** Flat, ordered list of every page - same order as the sidebar. Drives the prev/next footer. */
export const DOCS_PAGES: SidebarLink[] = DOCS_SIDEBAR_GROUPS.flatMap((group) => group.items);
