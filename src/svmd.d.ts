/**
 * svmd does not ship an ambient `*.md` module declaration yet, so `@svmd/content`'s
 * `import.meta.glob('/src/routes/docs/**\/index.md')` (see src/lib/docs/content.ts) has no type
 * without this. `metadata` isn't declared here because nothing reads it - each `index.md` renders
 * its own `<Prose {title} {description}>` using its own frontmatter local bindings.
 */
declare module '*.md' {
	import type { Component } from 'svelte';

	const component: Component<Record<string, never>>;
	export default component;
}
