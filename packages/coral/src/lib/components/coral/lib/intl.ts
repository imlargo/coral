/**
 * @coral/lib/intl
 * @version 1.0.0
 */

const cache = new Map<string, unknown>();

/**
 * One instance per constructor, locale and option set, built the first time it is asked for.
 *
 * Constructing an `Intl` object costs about what formatting a hundred values does, and the places
 * that need one sit in loops: a table of two hundred rows compares through a collator on every
 * step of a sort, and a list of timestamps would otherwise build two formatters per row. The
 * objects are stateless, so sharing them is free.
 *
 * Two option objects with the same keys in a different order land on two entries. That is harmless:
 * the key comes from a prop, and a prop is written once per call site. The cache is not bounded for
 * the same reason - its size is the number of distinct formats the application spells out.
 */
function cached<T>(
	kind: string,
	locale: string | undefined,
	options: object | undefined,
	build: () => T
): T {
	const key = `${kind}|${locale ?? ''}|${options ? JSON.stringify(options) : ''}`;
	if (cache.has(key)) return cache.get(key) as T;

	const built = build();
	cache.set(key, built);
	return built;
}

/** Text ordering. `locale` left out follows the reader's own. */
export function collator(locale?: string, options?: Intl.CollatorOptions): Intl.Collator {
	return cached('collator', locale, options, () => new Intl.Collator(locale, options));
}

export function dateTimeFormat(
	locale?: string,
	options?: Intl.DateTimeFormatOptions
): Intl.DateTimeFormat {
	return cached('date', locale, options, () => new Intl.DateTimeFormat(locale, options));
}

export function numberFormat(
	locale?: string,
	options?: Intl.NumberFormatOptions
): Intl.NumberFormat {
	return cached('number', locale, options, () => new Intl.NumberFormat(locale, options));
}

export function relativeTimeFormat(
	locale?: string,
	options?: Intl.RelativeTimeFormatOptions
): Intl.RelativeTimeFormat {
	return cached('relative', locale, options, () => new Intl.RelativeTimeFormat(locale, options));
}
