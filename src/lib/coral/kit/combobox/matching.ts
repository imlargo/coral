/**
 * @coral/kit/combobox
 * @version 4.1.0
 */

import { fold } from './fold.js';
import type { Option } from '../../lib/options.js';

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
