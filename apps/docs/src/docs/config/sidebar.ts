/**
 * Sidebar structure, consumed by svdocs's own `docs-sidebar.svelte` / `docs-breadcrumbs.svelte` /
 * `docs-page-footer.svelte` unchanged. "Getting started" is hand-ordered and barely changes - three
 * items is not worth deriving. "Kit" and "Blocks" are the sections that grow, so they come from the
 * docs collection itself: add `kit/<name>/index.md` or `blocks/<name>/index.md` and it appears
 * here, titled and sorted, with no second place to update.
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
const BLOCKS_PREFIX = 'blocks/';

// Plain pathnames, not run through `resolve()` here: with `(docs)` as a route group, `resolve()`'s
// typed overload wants either a literal `RouteId` (which, for a group, is spelled with the
// parens - not the real URL) or a value already typed `Pathname`. The consumers below already
// carry these through `resolve(item.href as Pathname)`, so building plain strings here and
// resolving them at the point of use is what lets a page keep the URL it actually has.
function section(prefix: string): SidebarLink[] {
	return getCollection('docs', (entry) => entry.slug.startsWith(prefix))
		.map((entry) => ({
			title: (entry.data as unknown as DocsFrontmatter).title,
			href: `/docs/${entry.slug}`
		}))
		.sort((a, b) => a.title.localeCompare(b.title));
}

const kit = section(KIT_PREFIX);
const blocks = section(BLOCKS_PREFIX);

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
	// Left out while empty, rather than a heading over nothing: there is currently no `blocks/*`
	// page, and this section reappears on its own the day one is added.
	...(blocks.length > 0 ? [{ title: 'Blocks', items: blocks }] : [])
];

/** Flat, ordered list of every page - same order as the sidebar. Drives the prev/next footer. */
export const DOCS_PAGES: SidebarLink[] = DOCS_SIDEBAR_GROUPS.flatMap((group) => group.items);
