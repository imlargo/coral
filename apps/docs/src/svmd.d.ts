/**
 * svmd does not ship an ambient `*.md` module declaration yet, so `@svmd/content`'s
 * `import.meta.glob('/src/routes/(docs)/docs/**\/index.md')` (see src/docs/content/docs.ts) has
 * no type without this. `metadata` stays `unknown` here - `docs.ts`'s `DocsFrontmatter` is the one
 * place that names its real shape, applied where `entry.data` is read.
 */
declare module '*.md' {
	import type { Component } from 'svelte';

	const component: Component<Record<string, never>>;
	export default component;
	export const metadata: unknown;
}
