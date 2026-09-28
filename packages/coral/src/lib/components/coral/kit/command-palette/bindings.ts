/**
 * @coral/kit/command-palette
 * @version 1.0.0
 */

import { parse } from '../shortcut/keys.js';
import type { Platform } from '../shortcut/keys.js';

/** The keys the command primitive reads as list navigation while Control is held. */
const VIM_KEYS = ['n', 'j', 'k', 'p', 'h', 'l'];

/**
 * Whether any of these combos is one the primitive's vim bindings would eat.
 *
 * Off a Mac, `mod+k` **is** `ctrl+k`, and the command primitive reads that as "previous item" -
 * preventing the default, which is exactly the signal `listen` treats as "something closer to the
 * focus has claimed this key". The palette would open on the combo and then refuse to close on it,
 * on every machine that is not a Mac. Empty entries are skipped, so an action without a shortcut
 * can be passed straight in.
 */
export function swallowsVimKey(
	combos: readonly (string | undefined)[],
	platform: Platform
): boolean {
	return combos
		.filter((combo): combo is string => Boolean(combo))
		.some((combo) => {
			const parsed = parse(combo, platform);
			return parsed.ctrl && !parsed.meta && !parsed.alt && VIM_KEYS.includes(parsed.key);
		});
}
