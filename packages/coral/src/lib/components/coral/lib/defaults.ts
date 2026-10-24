/**
 * @coral/lib/defaults
 * @version 1.0.0
 */

import { getContext, setContext } from 'svelte';

/**
 * What a project can set once instead of at every call site: the `locale` every formatting
 * component shares, and one entry per component, keyed by its manifest name.
 *
 * Each component adds its own entry from its `types.ts`, picked from its props, so only the
 * components a project installed appear here and a renamed prop fails to compile.
 */
export interface Defaults {
	/** Used by every component that takes `locale`, unless its own entry sets one. */
	locale?: string;
}

type ComponentName = Exclude<keyof Defaults, 'locale'>;
type Entry<Name extends ComponentName> = NonNullable<Defaults[Name]>;

const key = Symbol('coral/defaults');

/** Drops what was set to `undefined`, so it cannot hide the English default beneath it. */
function defined(entry: object | undefined): Record<string, unknown> {
	return Object.fromEntries(Object.entries(entry ?? {}).filter(([, value]) => value !== undefined));
}

/**
 * Sets defaults for every Coral component created below the calling component - call it in the
 * root layout for the whole app. Nested calls merge into the ones above them, entry by entry.
 *
 * Read once, when each component is created. An explicit prop always wins.
 */
export function setDefaults(defaults: Defaults): void {
	const parent = getContext<Defaults | undefined>(key) ?? {};
	const merged: Record<string, unknown> = { ...parent };

	for (const [name, value] of Object.entries(defaults)) {
		const inherited = merged[name];
		merged[name] =
			typeof value === 'object'
				? { ...(inherited as object), ...defined(value) }
				: (value ?? inherited);
	}
	setContext(key, merged);
}

/**
 * A component's defaults: its English fallbacks, under the project's `locale`, under its own entry.
 * Called during component initialisation, before `$props()` reads the result as prop fallbacks.
 */
export function defaultsFor<Name extends ComponentName, Fallback extends Entry<Name>>(
	name: Name,
	fallback: Fallback
): Fallback & Entry<Name> {
	const defaults = getContext<Defaults | undefined>(key);
	return {
		...fallback,
		...defined({ locale: defaults?.locale }),
		...defined(defaults?.[name])
	} as Fallback & Entry<Name>;
}
