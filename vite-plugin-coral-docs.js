/**
 * Build-time data for the docs site, exposed as two virtual modules.
 *
 * `virtual:coral-demo-sources` — every demo's own source, already highlighted. The point is that
 * a demo has exactly one source of truth: the `.svelte` file that renders in the preview is the
 * same text shown under the Code tab, so a demo cannot drift from the snippet documenting it.
 * Demos are any `.svelte` file under `src/routes/docs/<...>/demos/`, keyed by root-relative path
 * — the keys `import.meta.glob` produces — so `src/lib/docs/demos.ts` can pair each source with
 * its component and stays the only place that knows how a demo is named.
 *
 * `virtual:coral-docs-index` — one entry per docs page (title, description, headings) for the
 * search palette. Extracted from the Markdown rather than the rendered DOM so search works before
 * a page has ever been visited.
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { highlight } from './shiki.js';
import { slugifyAll } from './src/lib/docs/slug.js';

const SOURCES_ID = 'virtual:coral-demo-sources';
const INDEX_ID = 'virtual:coral-docs-index';
const RESOLVED = /** @type {const} */ ({
	[SOURCES_ID]: '\0' + SOURCES_ID,
	[INDEX_ID]: '\0' + INDEX_ID
});

const DOCS_ROOT = 'src/routes/docs';

/** @param {string} file @returns {string} */
const posix = (file) => file.split(path.sep).join('/');

/** @param {string} file @returns {boolean} */
function isDemo(file) {
	const normalized = posix(file);
	return normalized.includes(`/${DOCS_ROOT}/`) && /\/demos\/[^/]+\.svelte$/.test(normalized);
}

/** @param {string} file @returns {boolean} */
function isPage(file) {
	return posix(file).includes(`/${DOCS_ROOT}/`) && path.basename(file) === '+page.md';
}

/**
 * Pulls the searchable shape out of a docs page: its frontmatter title and description, plus
 * every `##`/`###` heading. Fenced blocks are stripped first — the conventions page documents
 * Markdown headings inside examples, and those are not sections of the page.
 *
 * @param {string} markdown
 * @returns {{ title: string; description: string; headings: { text: string; id: string }[] }}
 */
function parsePage(markdown) {
	const frontmatter = /^---\r?\n([\s\S]*?)\r?\n---/.exec(markdown)?.[1] ?? '';
	const field = (name) =>
		new RegExp(`^${name}:\\s*(.*)$`, 'm')
			.exec(frontmatter)?.[1]
			?.trim()
			.replace(/^['"]|['"]$/g, '') ?? '';

	const body = markdown
		.slice(frontmatter.length)
		.replace(/^---[\s\S]*?---/, '')
		.replace(/```[\s\S]*?```/g, '');

	const texts = [...body.matchAll(/^(#{2,3})\s+(.+?)\s*$/gm)].map(([, , text]) =>
		// Strip the inline Markdown that shows up in our headings: `code`, **bold**, [links](…).
		text
			.replace(/`([^`]+)`/g, '$1')
			.replace(/\*\*([^*]+)\*\*/g, '$1')
			.replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
			.trim()
	);

	const ids = slugifyAll(texts);

	return {
		title: field('title'),
		description: field('description'),
		headings: texts.map((text, i) => ({ text, id: ids[i] }))
	};
}

/** @param {string} file @param {string} projectRoot @returns {string} */
function hrefFor(file, projectRoot) {
	const rel = posix(path.relative(path.resolve(projectRoot, DOCS_ROOT), file));
	const dir = path.posix.dirname(rel);
	return dir === '.' ? '/docs' : `/docs/${dir}`;
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
			// No docs routes yet — an empty result is the honest answer, not a crash.
			return [];
		}
	}

	return {
		name: 'coral-docs',

		configResolved(config) {
			projectRoot = config.root;
		},

		resolveId(id) {
			return id === SOURCES_ID || id === INDEX_ID ? RESOLVED[id] : null;
		},

		async load(id) {
			if (id !== RESOLVED[SOURCES_ID] && id !== RESOLVED[INDEX_ID]) return null;

			const docsRoot = path.resolve(projectRoot, DOCS_ROOT);
			const files = await walk(docsRoot);

			if (id === RESOLVED[SOURCES_ID]) {
				/** @type {Record<string, { html: string; text: string }>} */
				const sources = {};

				for (const file of files.filter(isDemo)) {
					this.addWatchFile(file);
					const text = (await fs.readFile(file, 'utf8')).replace(/\n$/, '');
					const key = '/' + posix(path.relative(projectRoot, file));
					sources[key] = { html: await highlight(text, 'svelte'), text };
				}

				return `export const sources = ${JSON.stringify(sources)};`;
			}

			const pages = [];
			for (const file of files.filter(isPage)) {
				this.addWatchFile(file);
				pages.push({
					href: hrefFor(file, projectRoot),
					...parsePage(await fs.readFile(file, 'utf8'))
				});
			}

			return `export const pages = ${JSON.stringify(pages)};`;
		},

		handleHotUpdate({ file, server }) {
			if (!isDemo(file) && !isPage(file)) return;
			for (const resolved of Object.values(RESOLVED)) {
				const mod = server.moduleGraph.getModuleById(resolved);
				if (mod) server.moduleGraph.invalidateModule(mod);
			}
		}
	};
}
