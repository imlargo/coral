/**
 * @coral/kit/combobox
 * @version 4.1.0
 */

import type { Option } from '../../lib/options.js';

/**
 * The selection after a bulk "select all", given what the filter is currently showing.
 *
 * Additive, not a replacement. The two only differ once a search term is active, which for a
 * combobox is the ordinary case rather than the exotic one: replacing the selection would drop
 * whatever was picked before the term was typed, and drop it invisibly - the options that just
 * lost their tick are the ones the filter is hiding.
 *
 * Disabled options are skipped, since they cannot be picked one at a time either. One already in
 * the selection is kept: it got there somehow, and a bulk action is no place to quietly undo that.
 *
 * The result is ordered by `all` rather than by when each value arrived, so a bulk change reads
 * back the same as every other selection the component reports.
 */
export function selectAllVisible<T>(all: Option<T>[], visible: Option<T>[], current: T[]): T[] {
	// Membership by set rather than a scan per option: both of these are the whole list in the
	// unfiltered case, and a nested scan would make selecting all of a long list quadratic.
	// Options are matched by identity - `visible` is always a subset of `all`, never a rebuild.
	const showing = new Set(visible);
	// Values are matched the way the rest of the component matches them, `===`, which a `Set`
	// reproduces for everything an option can sensibly carry.
	const held = new Set(current);

	return all
		.filter((option) => held.has(option.value) || (showing.has(option) && !option.disabled))
		.map((option) => option.value);
}
