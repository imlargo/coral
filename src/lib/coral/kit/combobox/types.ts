/**
 * @coral/kit/combobox
 * @version 1.0.0
 */

import type { ComponentProps } from 'svelte';
import type { Popover } from '$lib/components/ui/popover/index.js';

/**
 * One entry in a selectable list.
 *
 * `value` is generic because the thing being selected is rarely a string - it is an id, an enum
 * member, a number. Closing this to `string` moves the conversion to every caller, and every
 * caller then converts it back on the way out.
 */
export type Option<T = string> = {
	value: T;
	label: string;
	disabled?: boolean;
};

/**
 * Everything the shadcn popover root accepts - `open`, `onOpenChange`, `onOpenChangeComplete` -
 * stays available. Coral supplies the body, so `children` is not forwarded.
 */
type RootProps = Omit<ComponentProps<typeof Popover>, 'children'>;

export type ComboboxProps<T> = RootProps & {
	/** The list to choose from. */
	options: Option<T>[];
	/**
	 * The selected value. Bindable. Matched against `option.value` with `===`, so object values
	 * are compared by reference.
	 */
	value?: T;
	/** Shown on the trigger while nothing is selected. */
	placeholder?: string;
	/** Shown in the search box. */
	searchPlaceholder?: string;
	/** Shown when the search matches nothing. */
	emptyMessage?: string;
	/** Blocks the trigger. */
	disabled?: boolean;
	/** Merged onto the trigger button. */
	class?: string;
};
