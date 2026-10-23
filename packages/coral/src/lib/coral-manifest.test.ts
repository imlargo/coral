/**
 * Checks `coral/coral.json` against the folder it describes and the registry it produces. The docs
 * site checks its own pages against the manifest; the library knows nothing about it.
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
import { COMPONENT_LAYERS, componentOf, isComponent, itemName } from '../../registry.config.js';
import { registry } from '../../scripts/registry.js';

const CORAL = path.join(import.meta.dirname, 'components/coral');

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
 * Component entries are folders; `lib/*` entries are a single file that may carry any extension,
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

// No `product/` entry exists yet, so these are what holds the layer to its shape until one does.
describe('layers', () => {
	it('finds the entry a file belongs to, one folder deeper under a product vertical', () => {
		expect(componentOf('kit/select/select.svelte')).toBe('kit/select');
		expect(componentOf('blocks/table-panel/panel.ts')).toBe('blocks/table-panel');
		expect(componentOf('product/ai/chat/chat.svelte')).toBe('product/ai/chat');
	});

	it('claims no entry for shared modules or loose files', () => {
		expect(componentOf('lib/options.ts')).toBeUndefined();
		expect(componentOf('kit/README.md')).toBeUndefined();
		expect(componentOf('product/ai/chat.svelte')).toBeUndefined();
	});

	it('keeps every folder in the item name', () => {
		expect(itemName('kit/select')).toBe('kit-select');
		expect(itemName('product/ai/chat')).toBe('product-ai-chat');
		expect(isComponent('product/ai/chat')).toBe(true);
		expect(isComponent('lib/options')).toBe(false);
	});
});

describe('coral.json', () => {
	it('describes every component in the folder, and only those', async () => {
		const all = await files();
		const folders = new Set(all.map(componentOf).filter((name) => name !== undefined));
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
				/from '#lib\/components\/ui\/([^/']+)(?:\/[^']*)?'/g
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
			for (const [, source] of text.matchAll(/from '([^'.#][^']*)'/g)) {
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
		// Derived from the layers rather than spelled out again: a new layer has one place to be
		// declared, and this test then holds it to the same rule as the others.
		const prefixes = [...COMPONENT_LAYERS, 'lib/'].map(itemName);

		for (const name of names) {
			if (name === 'coral') continue;
			expect(name, `${name} is missing its layer prefix`).toSatisfy((item: string) =>
				prefixes.some((prefix) => item.startsWith(prefix))
			);
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
