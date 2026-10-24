/**
 * @coral/lib/draft
 * @version 1.0.0
 */

import { flushSync } from 'svelte';
import { describe, expect, it } from 'vitest';
import { createDraft, sameData } from './draft.svelte.js';
import type { Draft } from './draft.svelte.js';

type Settings = { name: string; seats: number; tags: string[] };

/** A draft with an owner for its effects, the way a component gives it one. */
function build(initial: Settings) {
	let saved = $state(initial);
	let draft!: Draft<Settings>;
	const stop = $effect.root(() => {
		draft = createDraft(() => saved);
	});
	flushSync();
	return {
		draft,
		get saved() {
			return saved;
		},
		set saved(next: Settings) {
			saved = next;
		},
		stop
	};
}

describe('sameData', () => {
	it('compares data, not identity', () => {
		expect(sameData({ a: [1, { b: 2 }] }, { a: [1, { b: 2 }] })).toBe(true);
		expect(sameData({ a: 1 }, { a: 2 })).toBe(false);
		expect(sameData([1, 2], [1])).toBe(false);
		expect(sameData(new Date(5), new Date(5))).toBe(true);
		expect(sameData(null, {})).toBe(false);
	});
});

describe('Draft', () => {
	it('starts as a clean copy of what is saved', () => {
		const { draft, stop } = build({ name: 'api-gateway', seats: 3, tags: ['prod'] });
		expect(draft.current).toEqual({ name: 'api-gateway', seats: 3, tags: ['prod'] });
		expect(draft.dirty).toBe(false);
		stop();
	});

	it('is dirty once the copy differs, and clean again once the edit is undone', () => {
		const { draft, stop } = build({ name: 'api-gateway', seats: 3, tags: [] });
		draft.current.seats = 5;
		expect(draft.dirty).toBe(true);
		draft.current.seats = 3;
		expect(draft.dirty).toBe(false);
		stop();
	});

	it('never writes through to what is saved', () => {
		const { draft, saved, stop } = build({ name: 'api-gateway', seats: 3, tags: ['prod'] });
		draft.current.tags.push('staging');
		expect(saved.tags).toEqual(['prod']);
		stop();
	});

	it('resets to what is saved', () => {
		const { draft, stop } = build({ name: 'api-gateway', seats: 3, tags: [] });
		draft.current.name = 'gateway';
		draft.reset();
		expect(draft.current.name).toBe('api-gateway');
		expect(draft.dirty).toBe(false);
		stop();
	});

	it('turns clean on its own when the saved record catches up with the copy', () => {
		const state = build({ name: 'api-gateway', seats: 3, tags: [] });
		state.draft.current.seats = 5;
		expect(state.draft.dirty).toBe(true);

		state.saved = { name: 'api-gateway', seats: 5, tags: [] };
		flushSync();
		expect(state.draft.dirty).toBe(false);
		state.stop();
	});

	it('reseeds an untouched copy when the saved record changes, and keeps a touched one', () => {
		const untouched = build({ name: 'api-gateway', seats: 3, tags: [] });
		untouched.saved = { name: 'api-gateway', seats: 8, tags: [] };
		flushSync();
		expect(untouched.draft.current.seats).toBe(8);
		untouched.stop();

		const touched = build({ name: 'api-gateway', seats: 3, tags: [] });
		touched.draft.current.name = 'gateway';
		touched.saved = { name: 'api-gateway', seats: 8, tags: [] };
		flushSync();
		expect(touched.draft.current.name).toBe('gateway');
		expect(touched.draft.dirty).toBe(true);
		touched.stop();
	});

	it('takes an equality of its own', () => {
		const saved = $state({ name: 'A', seats: 1, tags: [] as string[] });
		let draft!: Draft<Settings>;
		const stop = $effect.root(() => {
			draft = createDraft(() => saved, {
				equals: (a, b) => a.name.toLowerCase() === b.name.toLowerCase()
			});
		});
		flushSync();
		draft.current.name = 'a';
		expect(draft.dirty).toBe(false);
		stop();
	});
});
