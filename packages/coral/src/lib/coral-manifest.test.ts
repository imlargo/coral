/**
 * Checks `coral/coral.json` against the folder it describes, the registry it produces and the
 * pages that document it.
 *
 * The manifest is what everything else is derived from - the registry items a project installs,
 * the versions they carry, the primitives they pull in - and it is kept by hand, so every claim in
 * it is a claim nothing else verifies. Before this file the
 * manifest had been wrong for a while in a way nobody could have noticed: seven components import
 * `@lucide/svelte` and not one of them declared it, so a project whose `components.json` picks a
 * different icon library would have copied the folder and found seven broken components.
 *
 * It lives outside `coral/` on purpose. Only `coral/` is copied into a consuming project, and a
 * test that reads the filesystem is repo tooling rather than part of the product.
 */

import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import manifest from './components/coral/coral.json' with { type: 'json' };
import { itemName, registry } from '../../scripts/registry.js';

const CORAL = path.join(import.meta.dirname, 'components/coral');
/** The docs site, which is a sibling workspace - see the note above about repo tooling. */
const DOCS = path.resolve(import.meta.dirname, '../../../../apps/docs/src/routes/(docs)/docs');

type Entry = {
	title: string;
	description: string;
	version: string;
	shadcn: string[];
	npm?: string[];
};
const entries = Object.entries(manifest.components) as [string, Entry][];

/** Every file under `coral/`, as paths relative to it, POSIX-separated. */
async function files(): Promise<string[]> {
	const found = await readdir(CORAL, { recursive: true, withFileTypes: true });
	return found
		.filter((entry) => entry.isFile())
		.map((entry) => path.relative(CORAL, path.join(entry.parentPath, entry.name)))
		.map((file) => file.split(path.sep).join('/'));
}

/**
 * The files belonging to one manifest entry.
 *
 * `kit/*` entries are folders; `lib/*` entries are a single file that may carry any extension,
 * which is what `lib/options.ts` and `lib/hidden-field.svelte` respectively are.
 */
function owned(name: string, all: string[]): string[] {
	return all.filter(
		(file) => file.startsWith(`${name}/`) || file.replace(MODULE_EXTENSION, '') === name
	);
}

const SOURCE = /\.(ts|svelte)$/;

/**
 * The extension a `lib/*` file drops to become its manifest name. `.svelte.ts` counts as one: a
 * module that needs runes has to be called that, and `lib/action.svelte` would be a name that
 * describes the compiler rather than the thing.
 */
const MODULE_EXTENSION = /(\.svelte)?\.[^./]+$/;
const isTest = (file: string) => /\.(test|spec)\.[^./]+$/.test(file);

describe('coral.json', () => {
	it('describes every component in the folder, and only those', async () => {
		const all = await files();
		const folders = new Set(
			all
				.filter((file) => file.startsWith('kit/'))
				.map((file) => file.split('/').slice(0, 2).join('/'))
		);
		const singles = new Set(
			all
				.filter((file) => file.startsWith('lib/') && !isTest(file))
				.map((file) => `lib/${file.split('/')[1].replace(MODULE_EXTENSION, '')}`)
		);

		expect([...folders, ...singles].sort()).toEqual(entries.map(([name]) => name).sort());
	});

	it.each(entries)('%s carries its version in every source file it owns', async (name, entry) => {
		const all = await files();
		const sources = owned(name, all).filter((file) => SOURCE.test(file));

		expect(sources.length, `no source files found for ${name}`).toBeGreaterThan(0);

		for (const file of sources) {
			const text = await readFile(path.join(CORAL, file), 'utf8');
			expect(text, `${file} is missing its @coral header`).toContain(`@coral/${name}`);
			expect(text, `${file} disagrees with coral.json`).toContain(`@version ${entry.version}`);
		}
	});

	it.each(entries)('%s declares every shadcn primitive it imports', async (name, entry) => {
		const all = await files();
		const imported = new Set<string>();

		for (const file of owned(name, all).filter((f) => SOURCE.test(f) && !isTest(f))) {
			const text = await readFile(path.join(CORAL, file), 'utf8');
			for (const [, primitive] of text.matchAll(
				/from '\$lib\/components\/ui\/([^/']+)(?:\/[^']*)?'/g
			)) {
				imported.add(primitive);
			}
		}

		expect([...imported].sort()).toEqual([...entry.shadcn].sort());
	});

	it.each(entries)('%s declares every npm package it imports', async (name, entry) => {
		const all = await files();
		const imported = new Set<string>();

		for (const file of owned(name, all).filter((f) => SOURCE.test(f) && !isTest(f))) {
			const text = await readFile(path.join(CORAL, file), 'utf8');
			for (const [, source] of text.matchAll(/from '([^'.$][^']*)'/g)) {
				// `svelte` and its subpaths are the framework, not a dependency to install.
				if (source === 'svelte' || source.startsWith('svelte/')) continue;
				// Scoped packages keep one leading segment: `@lucide/svelte/icons/x` is `@lucide/svelte`.
				const parts = source.split('/');
				imported.add(source.startsWith('@') ? parts.slice(0, 2).join('/') : parts[0]);
			}
		}

		expect([...imported].sort()).toEqual([...(entry.npm ?? [])].sort());
	});
});

describe('docs pages', () => {
	const kit = entries.filter(([name]) => name.startsWith('kit/'));

	it.each(kit)(
		'%s is documented, with the title and description the manifest states',
		async (name, entry) => {
			const page = await readFile(path.join(DOCS, name, 'index.md'), 'utf8');
			const frontmatter = /^---\r?\n([\s\S]*?)\r?\n---/.exec(page)?.[1];

			expect(frontmatter, `${name}/index.md has no frontmatter`).toBeDefined();
			expect(frontmatter).toContain(`title: ${entry.title}`);
			expect(frontmatter).toContain(`description: ${entry.description}`);
		}
	);
});

/**
 * The registry is generated, so these check the generator's output rather than a file someone
 * edits. What they are here to catch is the two mistakes that would be silent: a source file that
 * no item publishes, which a consumer would discover as a missing import, and a name that
 * collides with a shadcn-svelte item, which the CLI would resolve to one item and quietly drop the
 * other's files.
 */
describe('registry', () => {
	const built = registry(manifest.components as Record<string, Entry>);

	it('publishes every source file exactly once, at the path it already has', async () => {
		const { items } = await built;
		const published = items.flatMap((item) => item.files);
		const all = await files();
		const sources = all.filter((file) => SOURCE.test(file) && !isTest(file));

		expect(published.map((file) => file.path).sort()).toEqual(
			sources.map((file) => `src/lib/components/coral/${file}`).sort()
		);
		for (const file of published) {
			expect(file.target).toBe(file.path.replace('src/lib/components/', ''));
		}
	});

	it('leaves tests behind', async () => {
		const { items } = await built;
		const published = items.flatMap((item) => item.files.map((file) => file.path));

		expect(published.filter((file) => isTest(file))).toEqual([]);
	});

	it('names every item so it cannot be mistaken for a shadcn-svelte one', async () => {
		const { items } = await built;
		const names = items.map((item) => item.name);

		expect(new Set(names).size).toBe(names.length);
		for (const name of names) {
			if (name === 'coral') continue;
			expect(name, `${name} is missing its kit-/lib- prefix`).toMatch(/^(kit|lib)-/);
		}
	});

	it('pulls in the primitives and the shared modules each component imports', async () => {
		const { items } = await built;

		for (const [name, entry] of entries) {
			const item = items.find((candidate) => candidate.name === itemName(name));
			expect(item, `${name} has no registry item`).toBeDefined();
			expect(item!.registryDependencies).toEqual(expect.arrayContaining(entry.shadcn));
			// `toMatchObject`, not `meta.version`: the aggregate `coral` item carries no version, so
			// the field is optional across the list even though every component has one.
			expect(item!.meta).toMatchObject({ version: entry.version });
		}
	});
});
