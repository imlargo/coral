/**
 * Svelte options for the library workspace. There is no SvelteKit here on purpose: Coral imports
 * nothing from `$app` or `$env`, so the package builds, type-checks and tests as plain Svelte -
 * which is also the cheapest proof that what gets copied into a project carries no framework
 * assumptions beyond Svelte itself.
 *
 * @type {import('@sveltejs/vite-plugin-svelte').SvelteConfig}
 */
const config = {
	compilerOptions: {
		// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
		runes: ({ filename }) => (filename.split(/[/\\]/).includes('node_modules') ? undefined : true)
	}
};

export default config;
