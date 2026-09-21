import path from 'node:path';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vitest/config';
import { playwright } from '@vitest/browser-playwright';
import { svelte } from '@sveltejs/vite-plugin-svelte';

/**
 * `$lib` is SvelteKit's alias, and this package has no SvelteKit - but the source has to keep
 * using it, because `$lib/components/ui/*` and `$lib/utils.js` are exactly what a consuming
 * project resolves those imports to. Declaring it here is what lets the same text run in tests
 * here and land unchanged in someone else's `src/lib`.
 */
const lib = path.resolve(import.meta.dirname, 'src/lib');

export default defineConfig({
	plugins: [tailwindcss(), svelte()],
	resolve: {
		alias: [
			{ find: /^\$lib\/(.*)$/, replacement: `${lib}/$1` },
			{ find: /^\$lib$/, replacement: lib }
		]
	},
	test: {
		expect: { requireAssertions: true },
		projects: [
			{
				extends: './vite.config.ts',
				test: {
					name: 'client',
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
