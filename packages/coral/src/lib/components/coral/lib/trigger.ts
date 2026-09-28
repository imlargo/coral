/**
 * @coral/lib/trigger
 * @version 1.0.0
 */

import type { HTMLButtonAttributes } from 'svelte/elements';

/**
 * What a control with a button for a trigger takes from the page around it.
 *
 * The root of these components is a popover or a listbox, not an element, so an attribute passed
 * to it has nowhere to land - and these are exactly the ones a form needs: the `id` a `<Label for>`
 * points at, the `aria-describedby` a field's hint and error are wired through, the `aria-invalid`
 * a validator sets. They go to the trigger, which is the element a reader focuses and a screen
 * reader names. Spread by hand into the props of whatever renders one - the `id`, `name` and
 * `aria-*` a form library's control hands out arrive here unchanged.
 */
export type TriggerAttributes = Pick<
	HTMLButtonAttributes,
	'id' | 'aria-label' | 'aria-labelledby' | 'aria-describedby' | 'aria-invalid'
>;
