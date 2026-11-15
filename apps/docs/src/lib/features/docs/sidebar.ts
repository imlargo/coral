import { getCollection } from '#lib/features/docs/content.js';
import { COMPONENT_CATEGORIES } from '#lib/features/docs/categories.js';
import type { DocsFrontmatter, SidebarGroup, SidebarLink } from '#lib/features/docs/types.js';

/** The pages that come first, in reading order. They barely change, so they are not derived. */
const GETTING_STARTED: SidebarGroup = {
	title: 'Getting started',
	items: [
		{ title: 'Introduction', href: '/docs' },
		{ title: 'Installation', href: '/docs/installation' },
		{ title: 'Conventions', href: '/docs/conventions' },
		{ title: 'Changelog', href: '/docs/changelog' }
	]
};

// Every other page is listed by its frontmatter: add `kit/<name>/index.md` and it appears, with no
// second place to register it. A component page goes under its `category`, anything else under its
// `group`.
const others = getCollection('docs')
	.map((entry) => {
		const data = entry.data as unknown as DocsFrontmatter;
		return {
			title: data.title,
			section: data.category ?? data.group,
			href: entry.slug ? `/docs/${entry.slug}` : '/docs'
		};
	})
	.filter((page) => page.section !== GETTING_STARTED.title)
	.sort((a, b) => a.title.localeCompare(b.title));

const sections = [
	...COMPONENT_CATEGORIES.filter((title) => others.some((page) => page.section === title)),
	...new Set(
		others
			.map((page) => page.section)
			.filter((title) => !(COMPONENT_CATEGORIES as readonly string[]).includes(title))
	)
];

export const DOCS_SIDEBAR_GROUPS: SidebarGroup[] = [
	GETTING_STARTED,
	...sections.map((title) => {
		const items = others
			.filter((page) => page.section === title)
			.map(({ title, href }) => ({ title, href }));
		return { title, items, count: items.length };
	})
];

// Flat, ordered list of every page — same order as the sidebar, groups included, just without the
// group boundaries. Drives the prev/next footer.
export const DOCS_PAGES: SidebarLink[] = DOCS_SIDEBAR_GROUPS.flatMap((group) => group.items);
