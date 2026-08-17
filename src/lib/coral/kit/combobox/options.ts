/**
 * @coral/kit/combobox
 * @version 2.1.0
 */

import { fold } from './fold.js';
import type { ComboboxOptions, Option, OptionGroup } from './types.js';

/**
 * Whether an entry is a group rather than an option.
 *
 * Groups are told apart by carrying `options`, so an option may not have a property by that name.
 * The alternative - a `kind` discriminator - would have to be written on every option by hand,
 * which is a tax on the common case to make the rare one tidier.
 */
export function isGroup<T>(entry: Option<T> | OptionGroup<T>): entry is OptionGroup<T> {
	return entry !== null && typeof entry === 'object' && 'options' in entry;
}

/**
 * Reads either shape as groups, so the rest of the component only handles one.
 *
 * A flat list becomes a single unlabelled group. The first entry decides how the whole array is
 * read: a mixed array is a caller mistake, and guessing per entry would hide it.
 */
export function toGroups<T>(options: ComboboxOptions<T>): OptionGroup<T>[] {
	if (options.length === 0) return [];
	return isGroup(options[0])
		? (options as OptionGroup<T>[])
		: [{ options: options as Option<T>[] }];
}

/** Every option, in order, with the grouping discarded. */
export function flatten<T>(options: ComboboxOptions<T>): Option<T>[] {
	return toGroups(options).flatMap((group) => group.options);
}

/** The strings an option can be found by: what is shown, plus anything it was tagged with. */
export function terms<T>(option: Option<T>): string[] {
	return [option.label, option.description, ...(option.keywords ?? [])].filter(
		(term): term is string => typeof term === 'string' && term.length > 0
	);
}

/**
 * The default matcher: does this option answer this search?
 *
 * Folded on both sides, so `bogota` finds `Bogotá`. An empty search matches everything, which is
 * what makes the list appear in full before anyone types.
 */
export function matches<T>(option: Option<T>, search: string): boolean {
	const needle = fold(search.trim());
	if (needle === '') return true;
	return terms(option).some((term) => fold(term).includes(needle));
}

/**
 * Whether `value` is among `values`.
 *
 * Comparison is `===` throughout the component, so object values are matched by reference. That
 * is the predictable rule; a deep compare would silently make two equal-looking records the same
 * option, and there is no correct default for what "equal" means to a caller's domain type.
 */
export function includesValue<T>(values: T[], value: T): boolean {
	return values.some((candidate) => candidate === value);
}
