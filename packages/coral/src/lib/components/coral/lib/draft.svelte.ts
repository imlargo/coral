/**
 * @coral/lib/draft
 * @version 1.0.0
 */

import { untrack } from 'svelte';

/** Whether two plain values hold the same data: primitives, dates, arrays and plain objects. */
export function sameData(a: unknown, b: unknown): boolean {
	if (Object.is(a, b)) return true;
	if (a instanceof Date || b instanceof Date) {
		return a instanceof Date && b instanceof Date && a.getTime() === b.getTime();
	}
	if (Array.isArray(a) || Array.isArray(b)) {
		return (
			Array.isArray(a) &&
			Array.isArray(b) &&
			a.length === b.length &&
			a.every((entry, index) => sameData(entry, b[index]))
		);
	}
	if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) return false;

	const keys = Object.keys(a as object);
	return (
		keys.length === Object.keys(b as object).length &&
		keys.every((key) =>
			sameData((a as Record<string, unknown>)[key], (b as Record<string, unknown>)[key])
		)
	);
}

export type DraftOptions<T> = {
	/** Decides whether the draft still matches what is saved. Compares the data by default. */
	equals?: (current: T, saved: T) => boolean;
	/**
	 * Warns before the tab closes or the page reloads while the draft is dirty. On by default;
	 * navigation inside the app is the router's to guard, from `dirty`.
	 */
	guardUnload?: boolean;
};

/**
 * An editable copy of something saved, and whether it still matches.
 *
 * A settings page and an edit dialog both edit a copy and save it on request, and both need the
 * same three answers: what the copy holds, whether it differs from what is saved, and how to throw
 * it away. The copy is deep state, so fields bind to it directly; `dirty` is read against the
 * saved value as it stands, so a save that lands turns it false on its own, with nothing to call.
 */
export type Draft<T> = {
	/** The editable copy. Deep state: bind fields to its properties. */
	current: T;
	/** What is saved, as it stands. */
	readonly saved: T;
	/** Whether the copy differs from what is saved. */
	readonly dirty: boolean;
	/** Throws the edits away: the copy becomes what is saved. */
	reset(): void;
};

/**
 * Builds a draft of `saved`. Call it during a component's initialization, like any state that owns
 * an effect. A plain object with getters rather than a class: the type stays structural, so a draft
 * built in one copy of this file is accepted by a component that read another - a workspace link,
 * a test harness - where a class with private fields would not be.
 */
export function createDraft<T>(
	saved: () => T,
	{ equals = sameData, guardUnload = true }: DraftOptions<T> = {}
): Draft<T> {
	/** What the copy was last seeded from, to tell an untouched copy from a touched one. */
	let seeded = $state.snapshot(untrack(saved)) as T;
	let current = $state(structuredClone(seeded)) as T;

	function seed(value: T) {
		seeded = $state.snapshot(value) as T;
		current = structuredClone(seeded);
	}

	const dirty = () => !equals($state.snapshot(current) as T, saved());

	// A saved record that changes under an untouched copy - reloaded, or saved from elsewhere -
	// reseeds it. A copy the reader has already edited keeps their edits.
	$effect(() => {
		const next = saved();
		if (untrack(() => equals($state.snapshot(current) as T, seeded))) seed(next);
	});

	$effect(() => {
		if (!guardUnload || !dirty()) return;
		const warn = (event: BeforeUnloadEvent) => event.preventDefault();
		window.addEventListener('beforeunload', warn);
		return () => window.removeEventListener('beforeunload', warn);
	});

	return {
		get current() {
			return current;
		},
		set current(value: T) {
			current = value;
		},
		get saved() {
			return saved();
		},
		get dirty() {
			return dirty();
		},
		reset() {
			seed(saved());
		}
	};
}
