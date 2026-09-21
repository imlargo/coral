/**
 * Derives the shadcn-svelte registry from `coral.json` and the folder it describes.
 *
 * There is no hand-written `registry.json`. A component's files, the primitives it needs and the
 * version it carries are already stated once; a second copy of that in a checked-in registry file
 * would be a copy that can be wrong. `scripts/build-registry.js` turns what this returns into the
 * JSON the CLI builds from, and `coral-manifest.test.ts` checks it against the filesystem.
 */

import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { SITE } from '../registry.config.js';

export const PACKAGE = path.resolve(import.meta.dirname, '..');
export const CORAL = path.join(PACKAGE, 'src/lib/components/coral');

/**
 * What a project's `components.json` resolves the library's own imports to.
 *
 * `registry build` replaces these strings with placeholders (`$UI$`, `$UTILS$`, `$LIB$`), and the
 * CLI swaps each placeholder for the consumer's alias on install. Order matters inside the CLI:
 * `components` is substituted before `ui`, so it is pointed at a path Coral never imports -
 * otherwise `$lib/components/ui/button` would be claimed by the components alias and land wherever
 * the consumer keeps plain components rather than in their `ui/` folder.
 *
 * That is about import strings only. Where Coral's own files land is decided by their type and
 * `target` below, which is why Coral can live under `components/` without importing through that
 * alias: its files reach each other by relative path.
 */
const ALIASES = {
	components: '$lib/__coral_never_imports_this__',
	hooks: '$lib/__coral_never_imports_this_either__',
	ui: '$lib/components/ui',
	utils: '$lib/utils',
	lib: '$lib'
};

/**
 * Where Coral lands in a consuming project: `coral/` under its `components` alias, next to the
 * `ui/` folder shadcn keeps there - `$lib/components/coral/...` in a default setup, the same shape
 * this repo keeps it in.
 *
 * Every file is `registry:component`, which is the type the CLI resolves against that alias, so a
 * project that keeps its components somewhere else gets Coral there too. The folder below it is
 * spelled out per file in `target`.
 */
const INSTALL_ROOT = 'coral';
const FILE_TYPE = /** @type {const} */ ('registry:component');

const SOURCE = /\.(ts|svelte)$/;
const TEST = /\.(test|spec)\.[^./]+$/;
/** The extension a `lib/*` file drops to become its manifest name - see `coral-manifest.test.ts`. */
const MODULE_EXTENSION = /(\.svelte)?\.[^./]+$/;

/** @typedef {{ title: string; description: string; version: string; shadcn: string[]; npm?: string[] }} Entry */

/** Every file under `coral/`, as paths relative to it, POSIX-separated. */
async function files() {
	const found = await readdir(CORAL, { recursive: true, withFileTypes: true });
	return found
		.filter((entry) => entry.isFile())
		.map((entry) => path.relative(CORAL, path.join(entry.parentPath, entry.name)))
		.map((file) => file.split(path.sep).join('/'))
		.sort();
}

/**
 * The item name a manifest entry is published under: `kit/select` becomes `kit-select`.
 *
 * The slash cannot survive - it would write the item into a subdirectory of the registry output -
 * and the prefix cannot be dropped: the CLI merges an item's tree by name, so a Coral item called
 * `select` and shadcn's own `select` would be taken for the same thing and one of them silently
 * dropped, along with its files.
 *
 * @param {string} name
 */
export function itemName(name) {
	return name.replace('/', '-');
}

/**
 * The files one manifest entry owns. `kit/*` entries are folders; `lib/*` entries are a single
 * file that may carry any extension.
 *
 * @param {string} name
 * @param {string[]} all
 */
function owned(name, all) {
	return all.filter(
		(file) => file.startsWith(`${name}/`) || file.replace(MODULE_EXTENSION, '') === name
	);
}

/**
 * The manifest entries a file reaches into, as item names.
 *
 * Coral's components import each other by relative path (`../../lib/options.js`), which is what
 * lets the installed folder keep working whatever the consumer's aliases are. Resolving those
 * paths back to manifest entries is how an item learns to pull the rest of what it needs.
 *
 * @param {string} file the importing file, relative to `coral/`
 * @param {string} source
 * @param {string[]} names manifest entry names
 */
function internalDependencies(file, source, names) {
	/** @type {Set<string>} */
	const found = new Set();

	for (const [, specifier] of source.matchAll(/from '(\.[^']*)'/g)) {
		const target = path.posix.normalize(path.posix.join(path.posix.dirname(file), specifier));
		const owner = names.find(
			(name) => target.startsWith(`${name}/`) || target.replace(MODULE_EXTENSION, '') === name
		);
		if (owner && !file.startsWith(`${owner}/`)) found.add(owner);
	}

	return [...found];
}

/**
 * The registry item for one manifest entry.
 *
 * `dependencies` is deliberately absent: `registry build` reads every import and resolves the
 * package versions from this workspace's `package.json`, which is one less thing to keep in step.
 * `local:` is the CLI's way of spelling "another item of mine" - it becomes a URL relative to this
 * item's own, so the consumer's CLI fetches it from wherever the registry is served.
 *
 * @param {string} name
 * @param {Entry} entry
 * @param {string[]} all
 * @param {string[]} names
 */
async function item(name, entry, all, names) {
	const sources = owned(name, all).filter((file) => SOURCE.test(file) && !TEST.test(file));

	/** @type {Set<string>} */
	const internal = new Set();
	for (const file of sources) {
		const source = await readFile(path.join(CORAL, file), 'utf8');
		for (const dependency of internalDependencies(file, source, names)) internal.add(dependency);
	}

	return {
		name: itemName(name),
		type: FILE_TYPE,
		title: entry.title,
		description: entry.description,
		meta: { version: entry.version, coral: name },
		registryDependencies: [
			...entry.shadcn,
			...[...internal].sort().map((dependency) => `local:${itemName(dependency)}`)
		],
		files: sources.map((file) => ({
			path: path.posix.join('src/lib/components/coral', file),
			type: FILE_TYPE,
			target: path.posix.join(INSTALL_ROOT, file)
		}))
	};
}

/**
 * Tests stay out of the published items on purpose: they are written against this workspace's
 * test setup, and a consumer who copied them would inherit a dependency on it for no benefit. The
 * repo keeps them next to the component, where they belong.
 *
 * @param {Record<string, Entry>} components
 */
export async function registry(components) {
	const all = await files();
	const names = Object.keys(components);
	const items = [];

	for (const [name, entry] of Object.entries(components)) {
		items.push(await item(name, entry, all, names));
	}

	items.push({
		name: 'coral',
		type: FILE_TYPE,
		title: 'Coral',
		description: 'Every Coral component, and the shadcn primitives they are composed from.',
		meta: { coral: 'all' },
		registryDependencies: names
			.filter((name) => name.startsWith('kit/'))
			.map((name) => `local:${itemName(name)}`),
		files: []
	});

	return {
		$schema: 'https://shadcn-svelte.com/schema/registry.json',
		name: 'coral',
		homepage: SITE,
		aliases: ALIASES,
		items
	};
}
