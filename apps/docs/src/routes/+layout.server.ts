import { summarizeReleases } from '#lib/features/docs/releases.js';

// Server-only so the changelog's text stays out of the browser bundle: a page receives the summary.
const [changelog] = Object.values(
	import.meta.glob<string>('/src/content/docs/changelog/index.md', {
		query: '?raw',
		import: 'default',
		eager: true
	})
);

const release = summarizeReleases(changelog ?? '');

export const load = () => ({ release });
