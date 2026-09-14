import adapter from '@sveltejs/adapter-cloudflare';

/**
 * Single source of truth for Svelte options. `vite.config.ts` deliberately calls `sveltekit()`
 * with no arguments: passing options there makes Vite ignore this file, and `svelte-check` and
 * ESLint both read *this* one.
 *
 * Docs pages are svmd Markdown (`index.md`, wired in `vite.config.ts`), loaded by slug through
 * `@svmd/content` from the single catch-all route `src/routes/docs/[...slug]/` rather than routed
 * directly as `+page.md`: SvelteKit's build resolves each route to its source file through Vite's
 * manifest by exact path, and svmd's `.md` -> `.md.svmd.svelte` module id means that lookup misses
 * for a `.md` route file, which only ever surfaces in a full adapter build, not in dev. Loading
 * `index.md` through `import.meta.glob` instead sidesteps it - only `+page.svelte` is ever a route
 * file, so no extra `extensions` entry is needed here.
 *
 * @type {import('@sveltejs/kit').Config}
 */
const config = {
	compilerOptions: {
		// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
		runes: ({ filename }) => (filename.split(/[/\\]/).includes('node_modules') ? undefined : true)
	},

	kit: {
		adapter: adapter(),
		alias: {}
	}
};

export default config;
