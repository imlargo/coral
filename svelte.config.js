import { fileURLToPath } from 'node:url';
import adapter from '@sveltejs/adapter-cloudflare';
import { escapeSvelte, mdsvex } from 'mdsvex';
import { highlight } from './shiki.js';

// mdsvex reads the layout straight off disk with `fs.readFileSync`, so this has to be a real
// filesystem path — `$lib/...` and other Vite aliases fail with ENOENT, which the build swallows
// into a hang instead of an error.
const PROSE_LAYOUT = fileURLToPath(new URL('./src/lib/docs/prose.svelte', import.meta.url));

/**
 * Single source of truth for Svelte options. `vite.config.ts` deliberately calls `sveltekit()`
 * with no arguments: passing options there makes Vite ignore this file, and `svelte-check`,
 * ESLint and Prettier all read *this* one — so the two would silently disagree about `.md`.
 *
 * @type {import('@sveltejs/kit').Config}
 */
const config = {
	// Docs pages are mdsvex Markdown; `.svelte` still works everywhere else.
	extensions: ['.svelte', '.md'],

	preprocess: [
		mdsvex({
			extensions: ['.md'],
			// Every docs page is wrapped in the prose layout, which also receives its frontmatter.
			layout: { _: PROSE_LAYOUT },
			highlight: {
				// The wrapper is what `prose.svelte` hangs a copy button off — and what tells it
				// apart from a `<Preview>` code tab, which brings its own.
				highlighter: async (code, lang) =>
					escapeSvelte(`<div class="docs-md-code group">${await highlight(code, lang)}</div>`)
			}
		})
	],

	compilerOptions: {
		// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
		runes: ({ filename }) => {
			const parts = filename.split(/[/\\]/);
			if (parts.includes('node_modules')) return undefined;
			// mdsvex wraps each page as `<Layout {...$$props}>`, which runes mode rejects. Docs
			// pages hold prose and component tags, never runes, so auto-detect is enough.
			if (filename.endsWith('.md')) return undefined;
			return true;
		}
	},

	kit: {
		adapter: adapter(),
		alias: {}
	}
};

export default config;
