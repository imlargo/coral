/**
 * The changelog's newest entry for every manifest entry carries the version `coral.json` states.
 *
 * A version bumped without a changelog line leaves a reader with a new header in their copy and no
 * way to learn what changed. Entries run newest first, so the first one per name is the current one;
 * versions reused after the 1.0 reset only ever appear further down.
 */

import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import manifest from '#lib/components/coral/coral.json' with { type: 'json' };

const CHANGELOG = path.resolve(import.meta.dirname, '../../../content/docs/changelog/index.md');

/** `` - `kit/combobox` 1.3.0: ... `` */
const ENTRY = /^- `([a-z]+(?:\/[a-z-]+)+)` (\d+\.\d+\.\d+)\b/gm;

const page = await readFile(CHANGELOG, 'utf8');
const newest = new Map<string, string>();
for (const [, name, version] of page.matchAll(ENTRY)) {
	if (!newest.has(name)) newest.set(name, version);
}

const entries = Object.entries(manifest.components).map(([name, { version }]) => [name, version]);

describe('changelog', () => {
	it.each(entries)('%s has an entry for %s', (name, version) => {
		expect(newest.get(name), `no changelog entry for ${name}`).toBe(version);
	});
});
