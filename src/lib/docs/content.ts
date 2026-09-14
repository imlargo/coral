/**
 * Loads a docs page by slug, so `src/routes/docs/[...slug]/` is the only route that exists - one
 * dynamic route instead of a `+page.svelte` repeated at every docs path.
 *
 * A page is `index.md` under `src/routes/docs/<slug>/`, e.g. `kit/avatar/index.md` is slug
 * `kit/avatar`; the root `src/routes/docs/index.md` is slug `''`. `@svmd/content` derives that
 * from the path on its own - `index` is the one filename its default slug rule already strips.
 */

import { createContent } from '@svmd/content';

/**
 * Every docs page's frontmatter. Not validated by a schema - this is our own content, not user
 * input - so the route that reads it casts to this instead of adding a validator dependency for
 * two strings.
 */
export interface DocsFrontmatter {
	title: string;
	description: string;
}

const { getEntry, getCollection } = createContent({
	docs: {
		meta: import.meta.glob('/src/routes/docs/**/index.md', { eager: true, import: 'metadata' }),
		body: import.meta.glob('/src/routes/docs/**/index.md')
	}
});

export { getEntry, getCollection };
