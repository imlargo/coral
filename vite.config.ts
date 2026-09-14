import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vitest/config';
import { playwright } from '@vitest/browser-playwright';
import { sveltekit } from '@sveltejs/kit/vite';
import { svmd } from '@svmd/vite';
import { coralDocs } from './vite-plugin-coral-docs.js';
import { svmdHighlight } from './svmd-highlight.js';

// Svelte options live in `svelte.config.js` - see the note there before moving any back here.
export default defineConfig({
	plugins: [
		tailwindcss(),
		// svmd goes before the Svelte plugin: it hands vite-plugin-svelte already-compiled Svelte,
		// not markdown.
		svmd({ include: ['src/routes/docs/**/index.md'], highlight: svmdHighlight }),
		coralDocs(),
		sveltekit()
	],
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
					include: ['src/**/*.svelte.{test,spec}.{js,ts}'],
					exclude: ['src/lib/server/**']
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
