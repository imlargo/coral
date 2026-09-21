/**
 * Builds the registry Coral is installed from, into the docs site's static assets.
 *
 * The item list comes from `registry.js`, which derives it from `coral.json`; this file writes
 * that out and hands it to `shadcn-svelte registry build`, which reads every source file, rewrites
 * the import aliases into placeholders and emits one JSON per item plus an index.
 *
 * Usage: `pnpm --filter coral registry [--output <dir>]`.
 */

import { execFileSync } from 'node:child_process';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { SITE } from '../registry.config.js';
import { CORAL, PACKAGE, registry } from './registry.js';

const REGISTRY_FILE = path.join(PACKAGE, 'registry.json');
const DEFAULT_OUTPUT = path.resolve(PACKAGE, '../../apps/docs/static/r');

/**
 * Writes the `docs` line back onto each built item, for the components that have a page.
 *
 * `registry build` parses `registry.json` against a schema with no `docs` field and drops what it
 * does not know, so the link the CLI prints after an install has to be added to the output rather
 * than to the input.
 *
 * @param {string} output
 * @param {{ name: string; meta?: { coral?: string } }[]} items
 */
async function addDocsLinks(output, items) {
	for (const built of items) {
		const component = built.meta?.coral;
		if (!component?.startsWith('kit/')) continue;

		const file = path.join(output, `${built.name}.json`);
		const json = JSON.parse(await readFile(file, 'utf8'));
		json.docs = `Docs: ${SITE}/docs/${component}`;
		await writeFile(file, `${JSON.stringify(json, null, '\t')}\n`, 'utf8');
	}
}

const flag = process.argv.indexOf('--output');
const output = flag === -1 ? DEFAULT_OUTPUT : path.resolve(process.argv[flag + 1]);

const manifest = JSON.parse(await readFile(path.join(CORAL, 'coral.json'), 'utf8'));
const built = await registry(manifest.components);

await writeFile(REGISTRY_FILE, `${JSON.stringify(built, null, '\t')}\n`, 'utf8');

execFileSync(
	path.join(PACKAGE, 'node_modules/.bin/shadcn-svelte'),
	['registry', 'build', REGISTRY_FILE, '--output', output],
	{ cwd: PACKAGE, stdio: 'inherit' }
);

await addDocsLinks(output, built.items);

console.log(`Registry written to ${path.relative(process.cwd(), output)}`);
