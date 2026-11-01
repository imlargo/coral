/**
 * `import basic from './demos/basic.svelte?demo'`: one docs demo, as its component and its own
 * source highlighted at build time.
 *
 * A demo has exactly one source of truth: the `.svelte` file that renders in the preview is the
 * same text shown under the Code tab, so a demo cannot drift from the snippet documenting it. Each
 * page imports only its own demos, so a page carries those components and sources and no others.
 */

import fs from 'node:fs/promises';
import type { Plugin } from 'vite';
import { highlight } from './code-highlighter.ts';

const QUERY = '?demo';
const PREFIX = '\0coral-demo:';
// Not `.svelte`: vite-plugin-svelte compiles any id ending in it.
const SUFFIX = '.js';

export function demoSources(): Plugin {
	return {
		name: 'coral-demo-sources',
		enforce: 'pre',

		resolveId: {
			filter: { id: /\.svelte\?demo$/ },
			async handler(id, importer, options) {
				const resolved = await this.resolve(id.slice(0, -QUERY.length), importer, {
					...options,
					skipSelf: true
				});
				if (!resolved) return null;
				// Vite's dependency scanner skips `\0` ids; the component itself is what it has to crawl.
				if ((options as { scan?: boolean }).scan) return resolved;
				return PREFIX + resolved.id + SUFFIX;
			}
		},

		load: {
			filter: { id: /^\0coral-demo:/ },
			async handler(id) {
				const file = id.slice(PREFIX.length, -SUFFIX.length);
				this.addWatchFile(file);
				const text = (await fs.readFile(file, 'utf8')).replace(/\n$/, '');
				const source = { html: await highlight(text, 'svelte'), text };

				return [
					`import component from ${JSON.stringify(file)};`,
					`export default { component, source: ${JSON.stringify(source)} };`
				].join('\n');
			}
		},

		// The module is keyed by its `\0` id, not by the file, so an edit to the demo has to reach it.
		hotUpdate({ file, modules }) {
			const demo = this.environment.moduleGraph.getModuleById(PREFIX + file + SUFFIX);
			if (!demo) return;
			this.environment.moduleGraph.invalidateModule(demo);
			return [...modules, demo];
		}
	};
}
