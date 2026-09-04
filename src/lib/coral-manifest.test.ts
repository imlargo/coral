/**
 * Checks `coral/coral.json` against the folder it describes.
 *
 * The manifest *is* the install instructions - "copy the folder, then install these" - and it is
 * kept by hand, so every claim in it is a claim nothing else verifies. Before this file the
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
import manifest from './coral/coral.json' with { type: 'json' };

const CORAL = path.join(import.meta.dirname, 'coral');

type Entry = { version: string; shadcn: string[]; npm?: string[] };
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
		(file) => file.startsWith(`${name}/`) || file.replace(/\.[^./]+$/, '') === name
	);
}

const SOURCE = /\.(ts|svelte)$/;
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
				.map((file) => `lib/${file.split('/')[1].replace(/\.[^./]+$/, '')}`)
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
