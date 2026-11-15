import { describe, expect, it } from 'vitest';
import { DOCS_PAGES, DOCS_SIDEBAR_GROUPS } from './sidebar.ts';
import { getCollection } from './content.ts';

describe('docs sidebar', () => {
	it('lists every page exactly once', () => {
		const hrefs = DOCS_PAGES.map((page) => page.href);
		const pages = getCollection('docs').map((entry) =>
			entry.slug ? `/docs/${entry.slug}` : '/docs'
		);
		expect([...hrefs].sort()).toEqual([...pages].sort());
	});

	// A guide page added to the content but not to the static groups would open a second group of
	// the same name below the components.
	it('has no two groups with the same title', () => {
		const titles = DOCS_SIDEBAR_GROUPS.map((group) => group.title);
		expect(new Set(titles).size).toBe(titles.length);
	});
});
