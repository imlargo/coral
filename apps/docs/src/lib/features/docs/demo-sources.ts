/**
 * Build-time data for the docs site, exposed as a virtual module: `virtual:coral-demo-sources`,
 * every demo's own source, already highlighted.
 *
 * The point is that a demo has exactly one source of truth: the `.svelte` file that renders in
 * the preview is the same text shown under the Code tab, so a demo cannot drift from the snippet
 * documenting it. Demos are any `.svelte` file under `src/content/docs/<...>/demos/`, keyed by
 * root-relative path - the keys `import.meta.glob` produces - so `demos.ts` can pair each source
 * with its component and stays the only place that knows how a demo is named.
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import type { Plugin } from 'vite';
import { highlight } from './code-highlighter.ts';

const SOURCES_ID = 'virtual:coral-demo-sources';
const RESOLVED = '\0' + SOURCES_ID;

const DOCS_ROOT = 'src/content/docs';

const posix = (file: string): string => file.split(path.sep).join('/');

function isDemo(file: string): boolean {
	const normalized = posix(file);
	return normalized.includes(`/${DOCS_ROOT}/`) && /\/demos\/[^/]+\.svelte$/.test(normalized);
}

export function demoSources(): Plugin {
	let projectRoot = '';

	async function walk(root: string): Promise<string[]> {
		try {
			const entries = await fs.readdir(root, { recursive: true, withFileTypes: true });
			return entries
				.filter((entry) => entry.isFile())
				.map((entry) => path.join(entry.parentPath, entry.name));
		} catch {
			// No docs content yet - an empty result is the honest answer, not a crash.
			return [];
		}
	}

	return {
		name: 'coral-demo-sources',

		configResolved(config) {
			projectRoot = config.root;
		},

		resolveId(id) {
			return id === SOURCES_ID ? RESOLVED : null;
		},

		async load(id) {
			if (id !== RESOLVED) return null;

			const docsRoot = path.resolve(projectRoot, DOCS_ROOT);
			const files = await walk(docsRoot);

			const sources: Record<string, { html: string; text: string }> = {};

			for (const file of files.filter(isDemo)) {
				this.addWatchFile(file);
				const text = (await fs.readFile(file, 'utf8')).replace(/\n$/, '');
				const key = '/' + posix(path.relative(projectRoot, file));
				sources[key] = { html: await highlight(text, 'svelte'), text };
			}

			return `export const sources = ${JSON.stringify(sources)};`;
		},

		handleHotUpdate({ file, server }) {
			if (!isDemo(file)) return;
			const mod = server.moduleGraph.getModuleById(RESOLVED);
			if (mod) server.moduleGraph.invalidateModule(mod);
		}
	};
}
