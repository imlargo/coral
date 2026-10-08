/**
 * Sidebar structure, consumed by svdocs's own `docs-sidebar.svelte` / `docs-breadcrumbs.svelte` /
 * `docs-page-footer.svelte` unchanged. "Getting started" is hand-ordered and barely changes - three
 * items is not worth deriving. One section per component layer follows, built from the docs
 * collection itself: add `kit/<name>/index.md` and it appears, titled and sorted, with no second
 * place to update. A layer with no pages yet has no section.
 */

import { getCollection, type DocsFrontmatter } from '#docs/content/docs.js';
import { COMPONENT_LAYERS } from '#docs/registry.js';

export interface SidebarLink {
	title: string;
	href: string;
}

export interface SidebarGroup {
	title: string;
	items: SidebarLink[];
}

// Plain pathnames, not run through `resolve()` here: they are compared against
// `page.url.pathname`, and resolved at the point of use with `resolvePath()` (`#docs/resolve-path.ts`).
// Sorted by folder, then title, which keeps a `product/` vertical's pages together.
function section(layer: string): SidebarLink[] {
	return getCollection('docs', (entry) => entry.slug.startsWith(layer))
		.map((entry) => ({
			folder: entry.slug.slice(0, entry.slug.lastIndexOf('/')),
			title: (entry.data as unknown as DocsFrontmatter).title,
			href: `/docs/${entry.slug}`
		}))
		.sort((a, b) => a.folder.localeCompare(b.folder) || a.title.localeCompare(b.title))
		.map(({ title, href }) => ({ title, href }));
}

/** `kit/` is "Kit": the folder is the name. */
const titleOf = (layer: string) => layer.charAt(0).toUpperCase() + layer.slice(1, -1);

const layers = COMPONENT_LAYERS.map((layer) => ({ title: titleOf(layer), items: section(layer) }));

export const DOCS_SIDEBAR_GROUPS: SidebarGroup[] = [
	{
		title: 'Getting started',
		items: [
			{ title: 'Introduction', href: '/docs' },
			{ title: 'Installation', href: '/docs/installation' },
			{ title: 'Conventions', href: '/docs/conventions' }
		]
	},
	...layers.filter((group) => group.items.length > 0)
];

/** Flat, ordered list of every page - same order as the sidebar. Drives the prev/next footer. */
export const DOCS_PAGES: SidebarLink[] = DOCS_SIDEBAR_GROUPS.flatMap((group) => group.items);
