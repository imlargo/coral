/**
 * @coral/kit/combobox
 * @version 2.1.0
 */

import type { ComponentProps, Snippet } from 'svelte';
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
	/** Blocks selection. The option stays visible and searchable. */
	disabled?: boolean;
	/** Second line under the label. Searched along with it. */
	description?: string;
	/** Extra terms that should match this option without being shown - synonyms, codes, an old name. */
	keywords?: string[];
};

/** A labelled run of options, rendered under a heading. */
export type OptionGroup<T = string> = {
	label?: string;
	options: Option<T>[];
};

/**
 * Either a flat list or a grouped one. Do not mix the two in a single array - the first entry
 * decides how the whole array is read.
 */
export type ComboboxOptions<T> = Option<T>[] | OptionGroup<T>[];

/** What the `trigger` snippet receives. Spread `props` onto whatever element you render. */
export type TriggerContext<T> = {
	props: Record<string, unknown>;
	/** Every selected option. Empty when nothing is selected; at most one unless `type="multiple"`. */
	selected: Option<T>[];
	open: boolean;
	disabled: boolean;
	/** Deselects everything. */
	clear: () => void;
};

/** What the `option` snippet receives. */
export type OptionContext<T> = {
	option: Option<T>;
	selected: boolean;
};

/** What the `footer` snippet receives. Rendered below the list, inside the popover. */
export type FooterContext<T> = {
	selected: Option<T>[];
	/** Every option currently passing the filter. */
	visible: Option<T>[];
	clear: () => void;
	/** Selects every enabled option. Only meaningful when `type="multiple"`. */
	selectAll: () => void;
	close: () => void;
};

type RootProps = Omit<ComponentProps<typeof Popover>, 'children'>;

type BaseProps<T> = RootProps & {
	/** The list to choose from, flat or grouped. */
	options: ComboboxOptions<T>;
	/** Shown on the trigger while nothing is selected. */
	placeholder?: string;
	/** Shown in the search box. */
	searchPlaceholder?: string;
	/** Shown when the search matches nothing. */
	emptyMessage?: string;
	/** Blocks the trigger. */
	disabled?: boolean;
	/**
	 * Allows deselecting: adds a clear control to the trigger, and makes re-picking the selected
	 * option unset it.
	 */
	clearable?: boolean;
	/** Accessible label for the clear control. */
	clearLabel?: string;
	/** Renders a loading row in place of the list. Pair with `onsearch` for server-side search. */
	loading?: boolean;
	/**
	 * Submits with a surrounding form, as hidden inputs. One per value when `type="multiple"`.
	 */
	name?: string;
	/**
	 * Turns a value into the string a form submits. Defaults to `String`, which is right for ids,
	 * numbers and enum members - and wrong for objects, which stringify to `[object Object]`.
	 * Required when `name` is set and `T` is not a primitive.
	 */
	serialize?: (value: T) => string;
	/** The search term. Bindable, so the caller can read or reset it. */
	search?: string;
	/**
	 * Called as the user types. This is the hook for server-side search: fetch, then hand the
	 * results back through `options`. Debounced by `searchDebounce`.
	 */
	onsearch?: (search: string) => void;
	/** Milliseconds to wait before `onsearch` fires. `0` calls it on every keystroke. */
	searchDebounce?: number;
	/**
	 * Whether to filter on the client. Set `false` when the server already returned a filtered
	 * list, so the results are not filtered twice.
	 */
	shouldFilter?: boolean;
	/**
	 * Replaces the built-in matching. Return `true` to keep the option. The default folds accents
	 * and case, and matches against the label, the description and any keywords.
	 */
	filter?: (option: Option<T>, search: string) => boolean;
	/** How many badges the trigger shows before collapsing into a counter. `type="multiple"` only. */
	maxDisplay?: number;
	/** Merged onto the trigger button. */
	class?: string;
	/** Merged onto the popover content. */
	contentClass?: string;
	/** Merged onto the scrolling list. Use it to change the max height. */
	listClass?: string;
	/** Replaces the whole trigger. */
	trigger?: Snippet<[TriggerContext<T>]>;
	/** Replaces the body of each option row. The check indicator stays. */
	option?: Snippet<[OptionContext<T>]>;
	/** Replaces the empty state. */
	empty?: Snippet;
	/** Replaces the loading row. */
	indicator?: Snippet;
	/** Rendered below the list - bulk actions, a count, a "create new" affordance. */
	footer?: Snippet<[FooterContext<T>]>;
};

/** Which selection mode a combobox is in. */
export type ComboboxType = 'single' | 'multiple';

/** The shape of `value` for a given mode. */
export type ComboboxValue<T, Type extends ComboboxType> = Type extends 'multiple'
	? T[]
	: T | undefined;

/**
 * `Type` decides the shape of `value` and of `onchange`'s first argument, the same way `type`
 * does on shadcn's select. It is inferred from the `type` prop and defaults to `single`, so the
 * common case stays a plain `<Combobox options value />`.
 *
 * A conditional type rather than a union of two prop shapes: a union cannot be discriminated when
 * the discriminant is left out, and callers who omitted `type` lost the inferred parameters on
 * `onchange` entirely.
 */
export type ComboboxProps<T, Type extends ComboboxType = 'single'> = BaseProps<T> & {
	type?: Type;
	/** The selection. Bindable. Matched with `===`. An array when `type="multiple"`. */
	value?: ComboboxValue<T, Type>;
	/**
	 * Called when the user picks, toggles or clears - never on mount, and never when `value` is
	 * assigned from code. `option` is the row that changed, or `undefined` for a bulk change.
	 */
	onchange?: (value: ComboboxValue<T, Type>, option: Option<T> | undefined) => void;
};
