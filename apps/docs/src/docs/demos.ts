/**
 * Pairs each docs demo with its own source.
 *
 * A demo is a `.svelte` file under `src/routes/docs/<section>/<component>/demos/`, colocated
 * with the page that documents it. It is addressed by dropping `demos/` and the extension, so
 * `src/routes/docs/kit/avatar/demos/basic.svelte` is `kit/avatar/basic`.
 *
 * This module is the only place that knows that convention: the component comes from a glob and
 * the highlighted source from the build-time plugin, both keyed by the same root-relative path.
 */

import type { Component } from 'svelte';
import { sources } from 'virtual:coral-demo-sources';

const modules = import.meta.glob<{ default: Component }>('/src/routes/docs/**/demos/*.svelte', {
	eager: true
});

const PREFIX = '/src/routes/docs/';

function nameFor(modulePath: string): string {
	return modulePath
		.slice(PREFIX.length)
		.replace('/demos/', '/')
		.replace(/\.svelte$/, '');
}

export type Demo = {
	/** The rendered demo. */
	component: Component;
	/** Its source highlighted at build time, plus the plain text behind it, for copying. */
	source: { html: string; text: string };
};

const demos: Record<string, Demo> = Object.fromEntries(
	Object.entries(modules).map(([modulePath, module]) => [
		nameFor(modulePath),
		{ component: module.default, source: sources[modulePath] ?? { html: '', text: '' } }
	])
);

/**
 * Looks up a demo by name, throwing when it does not exist. Docs pages are prerendered, so a
 * typo fails the build instead of rendering an empty box nobody notices.
 */
export function getDemo(name: string): Demo {
	const demo = demos[name];
	if (!demo) {
		throw new Error(
			`Unknown demo "${name}". Expected src/routes/docs/${name.replace(/\/([^/]+)$/, '/demos/$1')}.svelte`
		);
	}
	return demo;
}
