/**
 * @coral/kit/select
 * @version 1.0.0
 */

import type { ComponentProps, Snippet } from 'svelte';
import type { Select, SelectTrigger } from '$lib/components/ui/select/index.js';
import type { Option, Options } from '../../lib/options.js';

/**
 * What the shadcn root accepts, minus everything Coral takes over.
 *
 * `type` is always `single` - a multiple select is a combobox in practice, see the note on the
 * component. `value` and `onValueChange` speak bits-ui's string keys rather than `T`. `items` is
 * derived from `options`, and `name` is re-declared because bits-ui's own hidden input would
 * submit the internal key instead of the value.
 */
type RootProps = Omit<
	ComponentProps<typeof Select>,
	'type' | 'value' | 'onValueChange' | 'children' | 'items' | 'name' | 'allowDeselect'
>;

/** What the `trigger` snippet receives. Replaces the label inside the trigger, not the button. */
export type TriggerContext<T> = {
	/** The selected option, or `undefined` while nothing is selected. */
	selected: Option<T> | undefined;
	placeholder: string;
	disabled: boolean;
};

/** What the `option` snippet receives. */
export type OptionContext<T> = {
	option: Option<T>;
	selected: boolean;
};

export type SelectProps<T> = RootProps & {
	/** The list to choose from, flat or grouped. */
	options: Options<T>;
	/** The selection. Bindable. Matched with `===`. */
	value?: T;
	/**
	 * Called when the user picks or clears - never on mount, and never when `value` is assigned
	 * from code. `option` is `undefined` when the selection was cleared.
	 */
	onchange?: (value: T | undefined, option: Option<T> | undefined) => void;
	/** Shown on the trigger while nothing is selected. */
	placeholder?: string;
	/** Blocks the trigger. */
	disabled?: boolean;
	/**
	 * Allows deselecting: adds a clear control to the trigger, and makes re-picking the selected
	 * option unset it.
	 */
	clearable?: boolean;
	/** Accessible label for the clear control. */
	clearLabel?: string;
	/** Submits with a surrounding form, as a hidden input. */
	name?: string;
	/**
	 * Turns a value into the string a form submits. Defaults to `String`, which is right for ids,
	 * numbers and enum members - and wrong for objects, which stringify to `[object Object]`.
	 * Required when `name` is set and `T` is not a primitive.
	 */
	serialize?: (value: T) => string;
	/** Trigger height, from the shadcn primitive. */
	size?: ComponentProps<typeof SelectTrigger>['size'];
	/** Merged onto the trigger. */
	class?: string;
	/** Merged onto the dropdown content. */
	contentClass?: string;
	/** Replaces the label inside the trigger. The chevron is the primitive's and stays. */
	trigger?: Snippet<[TriggerContext<T>]>;
	/** Replaces the body of each option row. The check indicator stays. */
	option?: Snippet<[OptionContext<T>]>;
};
