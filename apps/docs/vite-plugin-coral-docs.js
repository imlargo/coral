/**
 * Build-time data for the docs site, exposed as a virtual module: `virtual:coral-demo-sources`,
 * every demo's own source, already highlighted.
 *
 * The point is that a demo has exactly one source of truth: the `.svelte` file that renders in
 * the preview is the same text shown under the Code tab, so a demo cannot drift from the snippet
 * documenting it. Demos are any `.svelte` file under `src/routes/(docs)/docs/<...>/demos/`, keyed
 * by root-relative path - the keys `import.meta.glob` produces - so `src/docs/demos.ts` can pair
 * each source with its component and stays the only place that knows how a demo is named.
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { highlight } from './shiki.js';

const SOURCES_ID = 'virtual:coral-demo-sources';
const RESOLVED = '\0' + SOURCES_ID;

const DOCS_ROOT = 'src/routes/(docs)/docs';

/** @param {string} file @returns {string} */
const posix = (file) => file.split(path.sep).join('/');

/** @param {string} file @returns {boolean} */
function isDemo(file) {
	const normalized = posix(file);
	return normalized.includes(`/${DOCS_ROOT}/`) && /\/demos\/[^/]+\.svelte$/.test(normalized);
}

/** @returns {import('vite').Plugin} */
export function coralDocs() {
	/** @type {string} */
	let projectRoot;

	/** @param {string} root @returns {Promise<string[]>} */
	async function walk(root) {
		try {
			const entries = await fs.readdir(root, { recursive: true, withFileTypes: true });
			return entries
				.filter((entry) => entry.isFile())
				.map((entry) => path.join(entry.parentPath, entry.name));
		} catch {
			// No docs routes yet - an empty result is the honest answer, not a crash.
			return [];
		}
	}

	return {
		name: 'coral-docs',

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

			/** @type {Record<string, { html: string; text: string }>} */
			const sources = {};

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
