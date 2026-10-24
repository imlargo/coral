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
 *
 * Built during a component's initialization, like any state that owns an effect.
 */
export class Draft<T> {
	#saved: () => T;
	#equals: (current: T, saved: T) => boolean;
	#current = $state() as T;
	/** What the copy was last seeded from, to tell an untouched copy from a touched one. */
	#seeded: T;

	constructor(saved: () => T, { equals = sameData, guardUnload = true }: DraftOptions<T> = {}) {
		this.#saved = saved;
		this.#equals = equals;
		this.#seeded = untrack(saved);
		this.#current = structuredClone($state.snapshot(this.#seeded)) as T;

		// A saved record that changes under an untouched copy - reloaded, or saved from elsewhere -
		// reseeds it. A copy the reader has already edited keeps their edits.
		$effect(() => {
			const next = saved();
			if (untrack(() => this.#equals(this.#current, this.#seeded))) this.seed(next);
		});

		$effect(() => {
			if (!guardUnload || !this.dirty) return;
			const warn = (event: BeforeUnloadEvent) => event.preventDefault();
			window.addEventListener('beforeunload', warn);
			return () => window.removeEventListener('beforeunload', warn);
		});
	}

	/** The editable copy. Deep state: bind fields to its properties. */
	get current(): T {
		return this.#current;
	}

	set current(value: T) {
		this.#current = value;
	}

	/** What is saved, as it stands. */
	get saved(): T {
		return this.#saved();
	}

	/** Whether the copy differs from what is saved. */
	get dirty(): boolean {
		return !this.#equals($state.snapshot(this.#current) as T, this.#saved());
	}

	/** Throws the edits away: the copy becomes what is saved. */
	reset(): void {
		this.seed(this.#saved());
	}

	private seed(value: T) {
		this.#seeded = $state.snapshot(value) as T;
		this.#current = structuredClone(this.#seeded) as T;
	}
}
