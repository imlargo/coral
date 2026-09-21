import fs from 'node:fs';
import path from 'node:path';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { svmd } from '@svmd/vite';
import { coralDocs } from './vite-plugin-coral-docs.js';
import { rehypeHeadingAnchors } from './src/docs/rehype-heading-anchors.js';
import { svmdHighlight } from './svmd-highlight.js';

/**
 * The library workspace's runtime dependencies - bits-ui and the rest of what the shadcn
 * primitives import.
 *
 * They are installed next to `packages/coral`, not here, and Vite's dev SSR would hand their
 * `.svelte` files straight to Node, which has no idea what to do with the extension. Inlining
 * them fixes that. The list is read rather than written out so that adding a primitive that
 * brings a new dependency never means remembering this file.
 */
const coralDependencies = Object.keys(
	JSON.parse(
		fs.readFileSync(path.resolve(import.meta.dirname, '../../packages/coral/package.json'), 'utf8')
	).dependencies ?? {}
);

// Svelte options live in `svelte.config.js` - see the note there before moving any back here.
export default defineConfig({
	ssr: { noExternal: coralDependencies },
	plugins: [
		tailwindcss(),
		// svmd goes before the Svelte plugin: it hands vite-plugin-svelte already-compiled Svelte,
		// not markdown.
		svmd({
			include: ['src/routes/docs/**/index.md'],
			highlight: svmdHighlight,
			rehypePlugins: [rehypeHeadingAnchors]
		}),
		coralDocs(),
		sveltekit()
	]
});
