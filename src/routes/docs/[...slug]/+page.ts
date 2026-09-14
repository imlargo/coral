import { error } from '@sveltejs/kit';
import { getCollection, getEntry } from '$lib/docs/content.js';

// Every docs page is prerendered (see the root `+layout.ts`); the sidebar links to all of them,
// so the crawler would find them all anyway, but this keeps the build from depending on that.
export const entries = () => getCollection('docs').map((entry) => ({ slug: entry.slug }));

export const load = async ({ params }) => {
	const entry = getEntry('docs', params.slug);
	if (!entry) error(404, 'Not found');

	const { default: Content } = await entry.load();
	return { Content };
};
