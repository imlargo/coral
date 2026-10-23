import type { SearchEngine } from './engine.ts';

let pending: Promise<SearchEngine> | undefined;

/**
 * The search engine, built the first time it is asked for and shared after that.
 *
 * Both the index and the engine are dynamic imports, so none of it is in the page a reader lands on:
 * it is fetched when they open search, or a moment earlier when they reach for the button. A failed
 * load is forgotten, so opening search again tries again rather than replaying the error.
 */
export function loadEngine(): Promise<SearchEngine> {
	pending ??= Promise.all([import('virtual:svdocs-search'), import('./engine.ts')])
		.then(([{ sections }, { createEngine }]) => createEngine(sections))
		.catch((error) => {
			pending = undefined;
			throw error;
		});

	return pending;
}
