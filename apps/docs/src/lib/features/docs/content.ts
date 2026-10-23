import { createContent } from '@svmd/content';

export const { getEntry, getCollection } = createContent({
	docs: {
		meta: import.meta.glob('/src/content/docs/**/*.md', { eager: true, import: 'metadata' }),
		body: import.meta.glob('/src/content/docs/**/*.md')
	}
});

// Raw, unparsed file contents, keyed the same way as the glob above (`entry.path`). Backs the
// "Copy page" / "View as Markdown" actions, which want the source, not the rendered page. Lazy like
// the page bodies: eager would put every page's source in the bundle of every page.
const rawSources = import.meta.glob('/src/content/docs/**/*.md', {
	query: '?raw',
	import: 'default'
}) as Record<string, () => Promise<string>>;

export async function getRawSource(path: string): Promise<string> {
	return (await rawSources[path]?.()) ?? '';
}
