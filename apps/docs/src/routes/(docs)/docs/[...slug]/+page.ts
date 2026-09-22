import { error } from '@sveltejs/kit';
import { getCollection, getEntry, getRawSource, type DocsFrontmatter } from '$docs/content/docs.js';
import { DOCS_PAGES } from '$docs/config/sidebar.js';
import { itemName } from '$docs/registry.js';

// The sidebar links to every page anyway, but this keeps prerendering from depending on that.
export const entries = () => getCollection('docs').map((entry) => ({ slug: entry.slug }));

const KIT_PREFIX = 'kit/';

export const load = async ({ params }) => {
	const entry = getEntry('docs', params.slug);
	if (!entry) error(404, 'Not found');

	const { title, description } = entry.data as unknown as DocsFrontmatter;
	const { default: Content } = await entry.load();
	const raw = getRawSource(entry.path);

	const href = entry.slug ? `/docs/${entry.slug}` : '/docs';
	const index = DOCS_PAGES.findIndex((page) => page.href === href);
	const prev = index > 0 ? DOCS_PAGES[index - 1] : undefined;
	const next = index !== -1 && index < DOCS_PAGES.length - 1 ? DOCS_PAGES[index + 1] : undefined;

	const item = params.slug.startsWith(KIT_PREFIX) ? itemName(params.slug) : undefined;

	return { Content, title, description, raw, prev, next, item };
};
