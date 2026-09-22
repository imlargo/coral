/**
 * Loads a docs page by slug, so `src/routes/(docs)/docs/[...slug]/` is the only route that exists
 * - one dynamic route instead of a `+page.svelte` repeated at every docs path.
 *
 * A page is `index.md` under `src/routes/(docs)/docs/<slug>/`, e.g. `kit/avatar/index.md` is slug
 * `kit/avatar`; the root `src/routes/(docs)/docs/index.md` is slug `''`. `@svmd/content` derives
 * that from the path on its own - `index` is the one filename its default slug rule already strips.
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

/**
 * `(docs)` is escaped in every glob pattern below: `import.meta.glob` matches with picomatch,
 * where a bare `(...)` is capture-group syntax, not a literal folder name - unescaped, none of
 * these globs match a single file, and both `getCollection('docs')` and the raw-source lookup
 * come back empty with no error to point at why. The pattern is inlined at each call rather than
 * shared through a constant: Vite resolves `import.meta.glob`'s argument by static analysis of
 * the literal string in the call itself, not by evaluating a variable.
 */
const { getEntry, getCollection } = createContent({
	docs: {
		meta: import.meta.glob('/src/routes/[(]docs[)]/docs/**/index.md', {
			eager: true,
			import: 'metadata'
		}),
		body: import.meta.glob('/src/routes/[(]docs[)]/docs/**/index.md')
	}
});

export { getEntry, getCollection };

// Raw, unparsed file contents, keyed the same way as the glob above (`entry.path`). Backs
// `docs-page-actions.svelte`'s "Copy page" / "View as Markdown" actions, which want the source a
// reader (or an LLM) would paste, not a re-serialization of the rendered HTML.
const rawSources = import.meta.glob('/src/routes/[(]docs[)]/docs/**/index.md', {
	eager: true,
	query: '?raw',
	import: 'default'
}) as Record<string, string>;

export function getRawSource(path: string): string {
	return rawSources[path] ?? '';
}
