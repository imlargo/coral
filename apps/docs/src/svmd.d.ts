/**
 * svmd does not ship an ambient `*.md` module declaration yet, so `@svmd/content`'s
 * `import.meta.glob('/src/routes/docs/**\/index.md')` (see src/lib/docs/content.ts) has no type
 * without this. `metadata` stays `unknown` here - `content.ts`'s `DocsFrontmatter` is the one
 * place that names its real shape, applied where `entry.data` is read.
 */
declare module '*.md' {
	import type { Component } from 'svelte';

	const component: Component<Record<string, never>>;
	export default component;
	export const metadata: unknown;
}
