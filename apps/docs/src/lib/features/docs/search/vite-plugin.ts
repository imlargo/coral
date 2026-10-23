/**
 * The docs search index, as a virtual module: `import { sections } from 'virtual:svdocs-search'`.
 *
 * Built from the Markdown in `src/content/docs` when the module is first loaded, and again in dev
 * when one of those files changes. The site never imports it up front - `load.ts`
 * fetches it the first time search is opened - so it costs a page nothing until then.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import type { Plugin } from 'vite';
import { docsHref, extractSections } from './extract.ts';
import type { SearchSection } from './types.ts';

const ID = 'virtual:svdocs-search';
const RESOLVED = `\0${ID}`;
const CONTENT_DIR = 'src/content/docs';

export function searchIndex(): Plugin {
	let root = '';

	return {
		name: 'svdocs-search-index',

		configResolved(config) {
			root = config.root;
		},

		resolveId(id) {
			return id === ID ? RESOLVED : null;
		},

		async load(id) {
			if (id !== RESOLVED) return null;

			const dir = path.resolve(root, CONTENT_DIR);
			// No content yet is an empty index, not a crash.
			const entries = await fs
				.readdir(dir, { recursive: true, withFileTypes: true })
				.catch(() => []);
			const files = entries
				.filter((entry) => entry.isFile() && entry.name.endsWith('.md'))
				.map((entry) => path.join(entry.parentPath, entry.name))
				.sort();

			const sections: SearchSection[] = [];
			for (const file of files) {
				this.addWatchFile(file);
				const source = await fs.readFile(file, 'utf8');
				try {
					sections.push(...extractSections(source, docsHref(path.relative(dir, file))));
				} catch (cause) {
					// Bad frontmatter is the usual reason. Say which file, or the build failure is a mystery.
					this.error({
						message: `Could not index ${path.relative(root, file)}: ${cause instanceof Error ? cause.message : cause}`,
						cause
					});
				}
			}

			return `export const sections = ${JSON.stringify(sections)};`;
		},

		// Not `handleHotUpdate`: that does not fire when a page is created or deleted, and a new page
		// missing from the index until a restart is exactly the bug it would hide.
		configureServer(server) {
			const dir = path.resolve(root, CONTENT_DIR) + path.sep;
			const refresh = (file: string) => {
				if (!file.endsWith('.md') || !path.resolve(file).startsWith(dir)) return;
				const module = server.moduleGraph.getModuleById(RESOLVED);
				if (module) server.moduleGraph.invalidateModule(module);
			};
			server.watcher.on('add', refresh).on('change', refresh).on('unlink', refresh);
		}
	};
}
