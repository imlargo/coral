import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vitest/config';
import { playwright } from '@vitest/browser-playwright';
import { sveltekit } from '@sveltejs/kit/vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

const compilerOptions = {
	// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
	runes: ({ filename }: { filename: string }) =>
		filename.split(/[/\\]/).includes('node_modules') ? undefined : true
};

/*
 * A SvelteKit project with no routes: SvelteKit is here for `svelte-kit sync`, `$app/tsconfig` and
 * the `#lib` imports a consuming project resolves. Tests run on plain Svelte instead, because Coral
 * imports nothing from `$app` or `$env` and this is what proves it: a component that reached for
 * either fails here, not in a consumer that is a plain Svelte + Vite project.
 */
export default defineConfig({
	plugins: [
		tailwindcss(),
		process.env.VITEST ? svelte({ compilerOptions }) : sveltekit({ compilerOptions })
	],
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
