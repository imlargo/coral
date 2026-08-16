/**
 * Exposes every docs demo's own source, already highlighted, as `virtual:coral-demo-sources`.
 *
 * The point is that a demo has exactly one source of truth: the `.svelte` file that renders in
 * the preview is the same text shown under the Code tab. Nothing is transcribed by hand, so a
 * demo cannot drift from the snippet documenting it.
 *
 * Demos are any `.svelte` file under `src/routes/docs/<...>/demos/`. Sources are keyed by
 * root-relative path — the exact keys `import.meta.glob` produces — so that `src/lib/docs/demos.ts`
 * can pair each source with its component and stays the only place that knows how a demo is named.
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { highlight } from './shiki.js';

const VIRTUAL_ID = 'virtual:coral-demo-sources';
const RESOLVED_ID = '\0' + VIRTUAL_ID;

const DOCS_ROOT = 'src/routes/docs';

/** @param {string} file @returns {boolean} */
function isDemo(file) {
	const normalized = file.split(path.sep).join('/');
	return normalized.includes(`/${DOCS_ROOT}/`) && /\/demos\/[^/]+\.svelte$/.test(normalized);
}

/** @returns {import('vite').Plugin} */
export function coralDemos() {
	/** @type {string} */
	let projectRoot;

	return {
		name: 'coral-demos',

		configResolved(config) {
			projectRoot = config.root;
		},

		resolveId(id) {
			return id === VIRTUAL_ID ? RESOLVED_ID : null;
		},

		async load(id) {
			if (id !== RESOLVED_ID) return null;

			const docsRoot = path.resolve(projectRoot, DOCS_ROOT);

			/** @type {import('node:fs').Dirent[]} */
			let entries;
			try {
				entries = await fs.readdir(docsRoot, { recursive: true, withFileTypes: true });
			} catch {
				// No docs routes yet — an empty map is the honest answer, not a crash.
				return 'export const sources = {};';
			}

			/** @type {Record<string, { html: string; text: string }>} */
			const sources = {};

			for (const entry of entries) {
				if (!entry.isFile()) continue;
				const file = path.join(entry.parentPath, entry.name);
				if (!isDemo(file)) continue;

				this.addWatchFile(file);
				const text = (await fs.readFile(file, 'utf8')).replace(/\n$/, '');
				const key = '/' + path.relative(projectRoot, file).split(path.sep).join('/');
				sources[key] = { html: await highlight(text, 'svelte'), text };
			}

			return `export const sources = ${JSON.stringify(sources)};`;
		},

		handleHotUpdate({ file, server }) {
			if (!isDemo(file)) return;
			const mod = server.moduleGraph.getModuleById(RESOLVED_ID);
			if (mod) server.moduleGraph.invalidateModule(mod);
		}
	};
}
