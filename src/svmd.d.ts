/**
 * svmd does not ship an ambient `*.md` module declaration yet, so a static
 * `import Content from './content.md'` (every docs route, see src/routes/docs/) has no type
 * without this. `metadata` isn't declared here because no route imports it - each `content.md`
 * renders its own `<Prose {title} {description}>` using its own frontmatter local bindings.
 */
declare module '*.md' {
	import type { Component } from 'svelte';

	const component: Component<Record<string, never>>;
	export default component;
}
