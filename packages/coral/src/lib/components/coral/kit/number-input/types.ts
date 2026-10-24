/**
 * @coral/kit/number-input
 * @version 2.0.0
 */

import type { ComponentProps } from 'svelte';
import type { InputGroupInput } from '#lib/components/ui/input-group/index.js';

/**
 * Everything the shadcn input accepts - `placeholder`, `disabled`, `readonly`, `required`, `id`,
 * `aria-*`, `ref` - stays available. `value` and `type` are Coral's: the value is a number rather
 * than a string, and the field is a text one announced as a spinbutton.
 *
 * `files` goes with `type`: the shadcn input discriminates on it, and a number field can never
 * carry a `FileList`. `onchange` is Coral's as well - it reports the value, not the DOM event - and
 * leaving the input's own one in place intersects the two into a handler no caller can actually
 * satisfy. `min`, `max` and `step` are Coral's numbers, not the attributes of a text field.
 */
type InputProps = Omit<
	ComponentProps<typeof InputGroupInput>,
	'value' | 'type' | 'files' | 'onchange' | 'min' | 'max' | 'step' | 'name' | 'form'
>;

export type NumberInputProps = InputProps & {
	/** The value. Bindable. `undefined` means the field is empty. */
	value?: number;
	/** Lowest allowed value. Left out means unbounded downwards, negatives included. */
	min?: number;
	/** Highest allowed value. Left out means unbounded upwards. */
	max?: number;
	/** How much one press of a stepper, or an arrow key, moves the value. Also sets the precision. */
	step?: number;
	/** What Page Up and Page Down move the value by, and the arrows while Shift is held. */
	largeStep?: number;
	/**
	 * Decimals to round to. Derived from `step` when omitted, which is right almost always - set it
	 * when the step and the precision genuinely differ, as with a step of `1` on a currency field.
	 */
	decimals?: number;
	/**
	 * How the number is written and read: `1,5` in `de-DE`, `1.5` in `en-US`, where a comma groups
	 * thousands instead.
	 */
	locale?: string;
	/** Submits with a surrounding form, as the number itself (`1.5`) whatever the field shows. */
	name?: string;
	/** `id` of the form to submit with, for a field outside it. Ignored without `name`. */
	form?: string;
	/**
	 * Called when the value changes by a stepper or by a committed edit - never on mount, and never
	 * when `value` is assigned from code.
	 */
	onchange?: (value: number | undefined) => void;
	/** Accessible label for the decrement button. */
	decrementLabel?: string;
	/** Accessible label for the increment button. */
	incrementLabel?: string;
	/** Merged onto the input. */
	class?: string;
	/** Merged onto the input group - the bordered box around everything. */
	groupClass?: string;
};

declare global {
	interface CoralDefaults {
		/** Set once for every number input, through `setDefaults`. */
		'kit/number-input'?: Pick<NumberInputProps, 'decrementLabel' | 'incrementLabel' | 'locale'>;
	}
}
