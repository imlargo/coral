import { getCollection } from '#lib/features/docs/content.js';
import type { DocsFrontmatter, SidebarGroup, SidebarLink } from '#lib/features/docs/types.js';

/** The pages that come first, in reading order. They barely change, so they are not derived. */
const GETTING_STARTED: SidebarGroup = {
	title: 'Getting started',
	items: [
		{ title: 'Introduction', href: '/docs' },
		{ title: 'Installation', href: '/docs/installation' },
		{ title: 'Conventions', href: '/docs/conventions' }
	]
};

// Every other page is listed under the `group` in its frontmatter, sorted by title: add
// `kit/<name>/index.md` and it appears, with no second place to register it.
const others = getCollection('docs')
	.map((entry) => {
		const data = entry.data as unknown as DocsFrontmatter;
		return {
			title: data.title,
			group: data.group,
			href: entry.slug ? `/docs/${entry.slug}` : '/docs'
		};
	})
	.filter((page) => page.group !== GETTING_STARTED.title)
	.sort((a, b) => a.title.localeCompare(b.title));

const groupTitles = [...new Set(others.map((page) => page.group))];

export const DOCS_SIDEBAR_GROUPS: SidebarGroup[] = [
	GETTING_STARTED,
	...groupTitles.map((title) => ({
		title,
		items: others.filter((page) => page.group === title).map(({ title, href }) => ({ title, href }))
	}))
];

// Flat, ordered list of every page — same order as the sidebar, groups included, just without the
// group boundaries. Drives the prev/next footer.
export const DOCS_PAGES: SidebarLink[] = DOCS_SIDEBAR_GROUPS.flatMap((group) => group.items);
