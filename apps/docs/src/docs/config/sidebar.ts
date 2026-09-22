/**
 * Sidebar structure, consumed by svdocs's own `docs-sidebar.svelte` / `docs-breadcrumbs.svelte` /
 * `docs-page-footer.svelte` unchanged. "Getting started" is hand-ordered and barely changes - three
 * items is not worth deriving. "Kit" is the section that actually grows with every new component,
 * so it comes from the docs collection itself: add `kit/<name>/index.md` and it appears here,
 * titled and sorted, with no second place to update. "Blocks" isn't listed yet - nothing lives
 * there, per the repo's rule of three.
 */

import { resolve } from '$app/paths';
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

const kit: SidebarLink[] = getCollection('docs', (entry) => entry.slug.startsWith(KIT_PREFIX))
	.map((entry) => ({
		title: (entry.data as unknown as DocsFrontmatter).title,
		href: resolve(`/docs/${entry.slug}`)
	}))
	.sort((a, b) => a.title.localeCompare(b.title));

export const DOCS_SIDEBAR_GROUPS: SidebarGroup[] = [
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
	}
];

/** Flat, ordered list of every page - same order as the sidebar. Drives the prev/next footer. */
export const DOCS_PAGES: SidebarLink[] = DOCS_SIDEBAR_GROUPS.flatMap((group) => group.items);
