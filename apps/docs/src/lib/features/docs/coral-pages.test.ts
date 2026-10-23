/**
 * Every component in `coral.json` has a docs page, titled and described the way the manifest says.
 *
 * The manifest feeds the registry and the page feeds the site, so a description edited in only one
 * of them is invisible until a reader sees the two disagree. This lives in the site, not the
 * library: the library knows nothing about where it is documented.
 */

import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { isComponent } from 'coral/registry.config.js';
import manifest from '#lib/components/coral/coral.json' with { type: 'json' };

const CONTENT = path.resolve(import.meta.dirname, '../../../content/docs');

type Entry = { title: string; description: string };

/** `lib/*` is installed as a dependency of the layers above it, so it has no page of its own. */
const documented = (Object.entries(manifest.components) as [string, Entry][]).filter(([name]) =>
	isComponent(name)
);

describe('docs pages', () => {
	it.each(documented)(
		'%s is documented, with the title and description the manifest states',
		async (name, entry) => {
			const page = await readFile(path.join(CONTENT, name, 'index.md'), 'utf8');
			const frontmatter = /^---\r?\n([\s\S]*?)\r?\n---/.exec(page)?.[1];

			expect(frontmatter, `${name}/index.md has no frontmatter`).toBeDefined();
			expect(frontmatter).toContain(`title: ${entry.title}`);
			expect(frontmatter).toContain(`description: ${entry.description}`);
		}
	);
});
