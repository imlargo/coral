import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vitest/config';
import { playwright } from '@vitest/browser-playwright';
import adapter from '@sveltejs/adapter-cloudflare';
import { sveltekit } from '@sveltejs/kit/vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { svmd } from '@svmd/vite';
import { coralDocs } from './vite-plugin-coral-docs.js';
import { rehypeHeadingAnchors } from './src/docs/rehype-heading-anchors.js';
import { svmdHighlight } from './svmd-highlight.js';

/*
 * Docs pages are svmd Markdown (`index.md`), loaded by slug through `@svmd/content` from the
 * single catch-all route `src/routes/(docs)/docs/[...slug]/` rather than routed directly as
 * `+page.md`: SvelteKit's build resolves each route to its source file through Vite's manifest by
 * exact path, and svmd's `.md` -> `.md.svmd.svelte` module id misses that lookup, which only ever
 * surfaces in a full adapter build. Only `+page.svelte` is ever a route file.
 */

const compilerOptions = {
	// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
	runes: ({ filename }: { filename: string }) =>
		filename.split(/[/\\]/).includes('node_modules') ? undefined : true
};

/*
 * Tests run on plain Svelte, without SvelteKit. Coral imports nothing from `$app` or `$env`, and
 * this is what proves it: a component that reached for either would fail here, not in a consumer
 * project. It also keeps the Cloudflare adapter from starting a Workers runtime per test project.
 */
const site = [
	// svmd goes before the Svelte plugin: it hands vite-plugin-svelte already-compiled Svelte, not
	// markdown.
	svmd({
		// `(docs)` escaped: svmd matches `include` with picomatch, where a bare `(...)` is a
		// capture group, not a literal folder name.
		include: ['src/routes/[(]docs[)]/docs/**/index.md'],
		highlight: svmdHighlight,
		rehypePlugins: [rehypeHeadingAnchors]
	}),
	coralDocs(),
	sveltekit({ compilerOptions, adapter: adapter() })
];

export default defineConfig({
	plugins: [tailwindcss(), ...(process.env.VITEST ? [svelte({ compilerOptions })] : site)],
	test: {
		expect: { requireAssertions: true },
		projects: [
			{
				extends: './vite.config.ts',
				test: {
					name: 'client',
					setupFiles: ['./src/test-setup.ts'],
					browser: {
						enabled: true,
						provider: playwright(),
						instances: [{ browser: 'chromium', headless: true }]
					},
					include: ['src/**/*.svelte.{test,spec}.{js,ts}']
				}
			},

			{
				extends: './vite.config.ts',
				test: {
					name: 'server',
					environment: 'node',
					include: ['src/**/*.{test,spec}.{js,ts}'],
					exclude: ['src/**/*.svelte.{test,spec}.{js,ts}']
				}
			}
		]
	}
});
