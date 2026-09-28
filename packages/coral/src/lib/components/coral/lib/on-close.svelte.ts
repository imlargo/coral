/**
 * @coral/lib/on-close
 * @version 1.0.0
 */

import { untrack } from 'svelte';

/**
 * Runs `callback` whenever `open` goes from true to false, however that happened.
 *
 * A popover reports its own closing - Escape, a click outside, a pick - through `onOpenChange`, and
 * says nothing when the caller closes it by assigning `open`, which is what a `close()` handed to a
 * footer does, and what a palette does once an action has run. Anything that has to happen on
 * close, such as forgetting the search term, hung on that callback alone is skipped for exactly
 * those closes. Watching `open` covers all of them.
 *
 * Call it while a component initialises: it sets up an effect. It does not run for a component that
 * starts closed, and the callback is not tracked, so what it reads does not re-run it.
 */
export function onClose(open: () => boolean, callback: () => void): void {
	let wasOpen = false;

	$effect(() => {
		if (open()) {
			wasOpen = true;
			return;
		}
		if (!wasOpen) return;

		wasOpen = false;
		untrack(callback);
	});
}
