import { getCollection } from '#lib/features/docs/content.js';
import type { DocsFrontmatter, SidebarGroup, SidebarLink } from '#lib/features/docs/types.js';

/** The pages that come first, in reading order. They barely change, so they are not derived. */
const GUIDES: SidebarGroup[] = [
	{
		title: 'Getting started',
		items: [
			{ title: 'Introduction', href: '/docs' },
			{ title: 'Why Coral', href: '/docs/why-coral' },
			{ title: 'Installation', href: '/docs/installation' },
			{ title: 'Components', href: '/docs/components' },
			{ title: 'Theming', href: '/docs/theming' }
		]
	},
	{
		title: 'Concepts',
		items: [
			{ title: 'Ownership and updates', href: '/docs/ownership' },
			{ title: 'Architecture', href: '/docs/architecture' },
			{ title: 'Conventions', href: '/docs/conventions' },
			{ title: 'Accessibility', href: '/docs/accessibility' },
			{ title: 'Registry', href: '/docs/registry' }
		]
	},
	{
		title: 'Resources',
		items: [
			{ title: 'FAQ', href: '/docs/faq' },
			{ title: 'Changelog', href: '/docs/changelog' }
		]
	}
];

const GUIDE_HREFS = new Set(GUIDES.flatMap((group) => group.items.map((item) => item.href)));

// Every other page is listed under the `group` in its frontmatter: add `kit/<name>/index.md` and
// it appears, with no second place to register it. Sorted by folder, then title, which keeps a
// `product/` vertical's pages together.
const others = getCollection('docs')
	.map((entry) => {
		const data = entry.data as unknown as DocsFrontmatter;
		return {
			title: data.title,
			group: data.group,
			folder: entry.slug.slice(0, entry.slug.lastIndexOf('/')),
			href: entry.slug ? `/docs/${entry.slug}` : '/docs'
		};
	})
	.filter((page) => !GUIDE_HREFS.has(page.href))
	.sort((a, b) => a.folder.localeCompare(b.folder) || a.title.localeCompare(b.title));

const groupTitles = [...new Set(others.map((page) => page.group))];

export const DOCS_SIDEBAR_GROUPS: SidebarGroup[] = [
	...GUIDES,
	...groupTitles.map((title) => ({
		title,
		items: others.filter((page) => page.group === title).map(({ title, href }) => ({ title, href }))
	}))
];

// Flat, ordered list of every page — same order as the sidebar, groups included, just without the
// group boundaries. Drives the prev/next footer.
export const DOCS_PAGES: SidebarLink[] = DOCS_SIDEBAR_GROUPS.flatMap((group) => group.items);
