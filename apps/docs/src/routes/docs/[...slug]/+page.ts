import { error } from '@sveltejs/kit';
import { itemName } from '$docs/registry.js';
import { getCollection, getEntry, type DocsFrontmatter } from '$docs/content.js';

// Every docs page is prerendered (see the root `+layout.ts`); the sidebar links to all of them,
// so the crawler would find them all anyway, but this keeps the build from depending on that.
export const entries = () => getCollection('docs').map((entry) => ({ slug: entry.slug }));

export const load = async ({ params }) => {
	const entry = getEntry('docs', params.slug);
	if (!entry) error(404, 'Not found');

	const { title, description } = entry.data as unknown as DocsFrontmatter;
	const { default: Content } = await entry.load();

	// A component page gets its install command rendered for it; the rest of the docs get none.
	const item = params.slug.startsWith('kit/') ? itemName(params.slug) : undefined;

	return { Content, title, description, item };
};
