import { readFileSync } from 'node:fs';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vitest/config';
import adapter from '@sveltejs/adapter-cloudflare';
import { sveltekit } from '@sveltejs/kit/vite';
import { svmd } from '@svmd/vite';
import { highlightCode } from './src/lib/features/docs/code-highlighter.ts';
import { demoSources } from './src/lib/features/docs/demo-sources.ts';
import { rehypeHeadingIds } from './src/lib/features/docs/rehype-heading-ids.ts';
import { searchIndex } from './src/lib/features/docs/search/vite-plugin.ts';

/*
 * The library's runtime dependencies: bits-ui and the rest of what the shadcn primitives import.
 * They are installed next to `packages/coral`, not here, so Vite's dev SSR would hand their
 * `.svelte` files straight to Node. Inlining them fixes that, and reading the list means a
 * primitive that brings a new dependency never has to be remembered here.
 */
const coral = JSON.parse(
	readFileSync(new URL('../../packages/coral/package.json', import.meta.url), 'utf8')
) as { dependencies: Record<string, string> };

export default defineConfig({
	ssr: { noExternal: Object.keys(coral.dependencies) },
	plugins: [
		tailwindcss(),
		// svmd goes before the SvelteKit plugin: it hands vite-plugin-svelte already-compiled Svelte, not
		// markdown.
		svmd({
			include: ['src/content/docs/**/*.md', 'src/routes/**/+page.md'],
			highlight: highlightCode,
			rehypePlugins: [rehypeHeadingIds]
		}),
		searchIndex(),
		demoSources(),
		sveltekit({
			// Lets a `+page.md` be a route on its own, with no `+page.svelte` importing it - see
			// src/routes/(home)/+page.md.
			extensions: ['.svelte', '.md'],
			compilerOptions: {
				// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			},
			// Under Vitest the Cloudflare adapter starts a Workers runtime that keeps the process from
			// exiting, and tests never build anyway.
			adapter: process.env.VITEST ? undefined : adapter()
		})
	],
	test: {
		expect: { requireAssertions: true },
		projects: [
			{
				extends: './vite.config.ts',
				test: {
					name: 'server',
					environment: 'node',
					include: ['src/**/*.{test,spec}.{js,ts}']
				}
			}
		]
	}
});
