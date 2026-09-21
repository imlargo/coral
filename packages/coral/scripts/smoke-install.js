/**
 * Installs the built registry into a throwaway SvelteKit project and type-checks the result.
 *
 * This is the only check that exercises what a reader actually does: fetch an item over HTTP, let
 * the CLI resolve its shadcn primitives and its `local:` siblings, write the files into someone
 * else's `src/lib`, swap every alias placeholder for that project's own, and end with code that
 * compiles. The unit tests cover what the registry *says*; this covers whether it works.
 *
 * The consumer is scaffolded rather than initialized with `shadcn-svelte init`, which is
 * interactive and would need a terminal to answer it: `components.json`, the stylesheet and `cn`
 * are what init produces, and writing them directly keeps the run headless and identical every
 * time.
 *
 * Usage: `pnpm --filter coral smoke [--keep]`.
 */

import { spawn } from 'node:child_process';
import { createServer } from 'node:http';
import { mkdtemp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { createReadStream } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import process from 'node:process';
import { PACKAGE } from './registry.js';

const REGISTRY = path.resolve(PACKAGE, '../../apps/docs/static/r');
const keep = process.argv.includes('--keep');

/**
 * Runs a command in the throwaway project and resolves when it exits cleanly.
 *
 * Asynchronous on purpose. The registry is served from this same process, and a synchronous child
 * (`execFileSync`) blocks the event loop the server answers on: the CLI's first request never gets
 * its headers, and the run hangs until the fetch times out. Stdin is closed so every prompt the
 * CLIs ask takes its default instead of waiting on a keypress; the timeout is the backstop for one
 * that does neither.
 *
 * @param {string} command
 * @param {string[]} args
 * @param {string} cwd
 * @returns {Promise<void>}
 */
function run(command, args, cwd) {
	return new Promise((resolve, reject) => {
		const child = spawn(command, args, {
			cwd,
			stdio: ['ignore', 'inherit', 'inherit'],
			timeout: 15 * 60 * 1000,
			env: { ...process.env, CI: '1' }
		});
		child.on('error', reject);
		child.on('exit', (code, signal) =>
			code === 0
				? resolve()
				: reject(new Error(`${command} ${args.join(' ')} failed (${signal ?? `exit ${code}`})`))
		);
	});
}

/** Serves the built registry, so the CLI fetches items exactly as it would from the site. */
function serve() {
	const server = createServer((request, response) => {
		const file = path.join(
			REGISTRY,
			path.basename(new URL(request.url ?? '/', 'http://x').pathname)
		);
		response.setHeader('content-type', 'application/json');
		createReadStream(file)
			.on('error', () => {
				response.statusCode = 404;
				response.end('{}');
			})
			.pipe(response);
	});

	return new Promise((resolve) => {
		server.listen(0, '127.0.0.1', () => {
			const address = server.address();
			if (typeof address === 'string' || address === null) throw new Error('no port');
			resolve({ url: `http://127.0.0.1:${address.port}`, close: () => server.close() });
		});
	});
}

/**
 * A SvelteKit project with the three things a shadcn-svelte install needs: the config, a Tailwind
 * v4 stylesheet and `cn`.
 *
 * @param {string} cwd
 */
async function scaffold(cwd) {
	await run(
		'npx',
		[
			'--yes',
			'sv@latest',
			'create',
			'.',
			'--template',
			'minimal',
			'--types',
			'ts',
			'--no-add-ons',
			'--no-install'
		],
		cwd
	);
	// The `pnpm` on PATH, never `npx pnpm`: shadcn-svelte installs the primitives' dependencies with
	// whatever `pnpm` it finds, and a project scaffolded by a different major of pnpm has a store
	// that one refuses to touch (ERR_PNPM_UNEXPECTED_STORE).
	await run(
		'pnpm',
		[
			'add',
			'-D',
			'tailwindcss',
			'@tailwindcss/vite',
			'clsx',
			'tailwind-merge',
			'tw-animate-css',
			'shadcn-svelte',
			'svelte-check',
			'typescript'
		],
		cwd
	);

	await writeFile(
		path.join(cwd, 'vite.config.ts'),
		`import tailwindcss from '@tailwindcss/vite';\nimport { sveltekit } from '@sveltejs/kit/vite';\nimport { defineConfig } from 'vite';\n\nexport default defineConfig({ plugins: [tailwindcss(), sveltekit()] });\n`
	);
	await writeFile(
		path.join(cwd, 'components.json'),
		`${JSON.stringify(
			{
				$schema: 'https://shadcn-svelte.com/schema.json',
				tailwind: { css: 'src/app.css', baseColor: 'neutral' },
				aliases: {
					components: '$lib/components',
					utils: '$lib/utils',
					ui: '$lib/components/ui',
					hooks: '$lib/hooks',
					lib: '$lib'
				},
				typescript: true,
				registry: 'https://shadcn-svelte.com/registry',
				style: 'nova',
				iconLibrary: 'lucide',
				menuColor: 'default',
				menuAccent: 'subtle'
			},
			null,
			'\t'
		)}\n`
	);

	const baseline = await readFile(path.join(PACKAGE, 'src/app.css'), 'utf8');
	await writeFile(path.join(cwd, 'src/app.css'), baseline.replace(/@plugin '.*';\n/g, ''));
	await mkdir(path.join(cwd, 'src/lib'), { recursive: true });
	await writeFile(
		path.join(cwd, 'src/lib/utils.ts'),
		await readFile(path.join(PACKAGE, 'src/lib/utils.ts'), 'utf8')
	);
	await mkdir(path.join(cwd, 'src/routes'), { recursive: true });
	await writeFile(
		path.join(cwd, 'src/routes/+layout.svelte'),
		`<script lang="ts">\n\timport '../app.css';\n\tlet { children } = $props();\n</script>\n\n{@render children()}\n`
	);
}

/**
 * Every file the registry publishes, as the path it should land on.
 *
 * The install below asks for the aggregate `coral` item and nothing else, which is the strongest
 * form of the check: if its dependency list is wrong, a component silently goes missing, and
 * comparing what arrived against every item's `target` is what catches that. Asking for every
 * item by URL would install the same files while proving nothing about the aggregate.
 */
async function published() {
	const files = await readdir(REGISTRY);
	const targets = [];

	for (const file of files) {
		if (!file.endsWith('.json') || file === 'index.json') continue;
		const item = JSON.parse(await readFile(path.join(REGISTRY, file), 'utf8'));
		for (const published of item.files ?? []) targets.push(published.target);
	}

	return targets.sort();
}

const registry = await serve();
const cwd = await mkdtemp(path.join(os.tmpdir(), 'coral-smoke-'));
console.log(`Consumer project: ${cwd}`);

try {
	await scaffold(cwd);

	await run(
		'npx',
		['--yes', 'shadcn-svelte@latest', 'add', `${registry.url}/coral.json`, '-y', '-o'],
		cwd
	);

	const expected = await published();
	const installed = (await readdir(path.join(cwd, 'src/lib/components/coral'), { recursive: true }))
		.map((file) => path.posix.join('coral', String(file).split(path.sep).join('/')))
		.sort();
	const missing = expected.filter((file) => !installed.includes(file));

	if (missing.length > 0) {
		throw new Error(`The aggregate item did not bring:\n  ${missing.join('\n  ')}`);
	}

	await run('npx', ['svelte-kit', 'sync'], cwd);
	await run('npx', ['svelte-check', '--tsconfig', './tsconfig.json'], cwd);

	console.log(
		`\nInstalled all ${expected.length} published files under src/lib/components/coral, and they type-check.`
	);
} finally {
	registry.close();
	if (!keep) await rm(cwd, { recursive: true, force: true });
	else console.log(`Kept ${cwd}`);
}
