import manifest from '#lib/components/coral/coral.json' with { type: 'json' };
import { itemName } from 'coral/registry.config.js';
import { config } from '#lib/config/app.js';

/** What a component page states before anything is installed: where it comes from, what it brings. */
export interface ComponentMeta {
	/** Manifest name, e.g. `kit/combobox`. */
	name: string;
	/** Registry item, e.g. `kit-combobox`. */
	item: string;
	version: string;
	/** shadcn-svelte primitives the CLI installs alongside it. */
	shadcn: string[];
	/** npm packages it imports. */
	npm: string[];
	/** Every published file a manual copy needs, its own and the `lib/` modules it reaches, in order. */
	files: string[];
	/** The `lib/` entries among them. */
	lib: string[];
}

type Entry = { version: string; shadcn: string[]; npm?: string[] };
const entries = manifest.components as Record<string, Entry>;

// Raw sources, fetched only for the page being rendered. Tests and their harnesses are not
// published, so a manual copy leaves them out too.
const sources = import.meta.glob<string>(
	[
		'../../../../../../packages/coral/src/lib/components/coral/**/*.{svelte,ts}',
		'!**/*.test.*',
		'!**/*.spec.*'
	],
	{ query: '?raw', import: 'default' }
);

const ROOT = 'packages/coral/src/lib/components/coral/';
const fileOf = (key: string) => key.slice(key.indexOf(ROOT) + ROOT.length);
const keyOf = new Map(Object.keys(sources).map((key) => [fileOf(key), key]));

const MODULE_EXTENSION = /(\.svelte)?\.[^./]+$/;
const ownerOf = (file: string) =>
	Object.keys(entries).find(
		(name) => file.startsWith(`${name}/`) || file.replace(MODULE_EXTENSION, '') === name
	);

const posixJoin = (from: string, specifier: string) => {
	const parts = from.split('/').slice(0, -1);
	for (const part of specifier.split('/')) {
		if (part === '..') parts.pop();
		else if (part !== '.') parts.push(part);
	}
	return parts.join('/');
};

/**
 * Follows a component's relative imports into `lib/`, transitively: `lib/number-field` reaches
 * `lib/number`, which reaches `lib/intl`. The same rule the registry generator applies, read from
 * the same files, so the manual copy and the CLI install agree on what a component needs.
 */
export async function componentMeta(name: string): Promise<ComponentMeta | undefined> {
	const entry = entries[name];
	if (!entry) return undefined;

	const owned = (owner: string) => [...keyOf.keys()].filter((file) => ownerOf(file) === owner);
	const lib = new Set<string>();
	const pending = [name];

	while (pending.length) {
		const owner = pending.pop()!;
		for (const file of owned(owner)) {
			const source = await sources[keyOf.get(file)!]();
			for (const [, specifier] of source.matchAll(/from '(\.[^']*)'/g)) {
				const target = ownerOf(posixJoin(file, specifier.replace(/\.js$/, '')));
				if (target && target !== name && !lib.has(target)) {
					lib.add(target);
					pending.push(target);
				}
			}
		}
	}

	const libNames = [...lib].sort();
	return {
		name,
		item: itemName(name),
		version: entry.version,
		shadcn: entry.shadcn,
		npm: entry.npm ?? [],
		files: [name, ...libNames].flatMap(owned).sort(),
		lib: libNames
	};
}

/** Where a file of Coral, or a folder of it, is read on GitHub. */
export const sourceUrl = (path: string) =>
	`${config.links.github}/tree/main/packages/coral/src/lib/components/coral/${path}`;
