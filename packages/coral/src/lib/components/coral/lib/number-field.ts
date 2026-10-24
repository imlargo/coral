/**
 * @coral/lib/number-field
 * @version 2.0.0
 */

import { format, parse, stepValue } from './number.js';

/**
 * What a number field needs to know about itself, read through functions so it is always the
 * current value of a prop and never the one it had when the field was built.
 */
export type NumberFieldConfig = {
	value: () => number | undefined;
	/** Writes the bindable. Reporting the change is `onchange`'s job, not this one's. */
	set: (next: number | undefined) => void;
	min: () => number | undefined;
	max: () => number | undefined;
	/** What an arrow key moves the value by. */
	step: () => number;
	/** What Page Up and Page Down move it by, and the arrows while Shift is held. */
	largeStep: () => number;
	/** The precision every step and every typed value is rounded to. */
	decimals: () => number;
	/** How the field writes the number and reads what is typed: `1,5` or `1.5`. */
	locale: () => string;
	/** Whether the reader may change the value at all - not disabled, not read-only. */
	editable: () => boolean;
	onchange: () => ((value: number | undefined) => void) | undefined;
};

export const numberFieldClass = 'w-16 text-center';

/** The behaviour `kit/number-input` and `kit/scrub-input` share; what differs is the controls around it. */
export function numberField(config: NumberFieldConfig) {
	const text = (value: number | undefined) => format(value, config.decimals(), config.locale());
	const read = (raw: string) =>
		parse(raw, config.min(), config.max(), config.decimals(), config.locale());

	/** The one door: nothing is written, and nothing reported, unless the value actually moved. */
	function commit(next: number | undefined) {
		if (next === config.value()) return;
		config.set(next);
		config.onchange()?.(next);
	}

	/** Steps from `from`, which is the held value unless the reader is partway through typing one. */
	function nudge(delta: number, from = config.value()) {
		if (!config.editable()) return;

		commit(
			stepValue({
				value: from,
				delta,
				min: config.min(),
				max: config.max(),
				decimals: config.decimals()
			})
		);
	}

	/**
	 * Reads the field on commit - blur, Enter - not per keystroke. Clamping per keystroke fights the
	 * typist: with a max of 100, the `1` and the `15` of `150` are both fine, and only the finished
	 * number is wrong. Skipping the commit-time clamp is the other half of the bug: typed entry then
	 * lands on values the steppers themselves refuse to reach.
	 */
	function change(event: Event & { currentTarget: HTMLInputElement }) {
		const field = event.currentTarget;
		const next = read(field.value);

		commit(next);

		// The element keeps whatever was typed. When that text clamped to a number the value already
		// held, nothing re-renders and the field is left showing `150` over a value of `100`.
		field.value = text(next);
	}

	/**
	 * The spinbutton keys. Up and Down step, Shift makes them coarse, Page Up and Page Down are
	 * coarse, Home and End go to the bounds. Left and Right are left alone: in a text field they move
	 * the caret, and taking that away makes the number impossible to edit.
	 */
	function keydown(event: KeyboardEvent & { currentTarget: HTMLInputElement }) {
		if (!config.editable()) return;

		const field = event.currentTarget;
		const step = event.shiftKey ? config.largeStep() : config.step();
		const large = config.largeStep();
		const min = config.min();
		const max = config.max();
		// `47` typed over a held `4` steps to `48`, as it would in a native number field.
		const typed = field.value === text(config.value()) ? config.value() : read(field.value);
		const by = (delta: number) => {
			nudge(delta, typed);
			field.value = text(config.value());
			return true;
		};

		/** Each key returns whether it acted; one that did not is left to the caret or a dialog above. */
		const keys: Record<string, () => boolean> = {
			ArrowUp: () => by(step),
			ArrowDown: () => by(-step),
			PageUp: () => by(large),
			PageDown: () => by(-large),
			Home: () => min !== undefined && (commit(min), true),
			End: () => max !== undefined && (commit(max), true),
			// Puts back what the field held before the edit that is still being typed.
			Escape: () => {
				const held = text(config.value());
				if (field.value === held) return false;
				field.value = held;
				// The first Escape is the field's, the second is the dialog's - the rule search-input
				// and inline-edit follow.
				event.stopPropagation();
				return true;
			}
		};

		if (keys[event.key]?.()) event.preventDefault();
	}

	/**
	 * A text field announced as a spinbutton, with its value and bounds. `type="number"` would give
	 * that for free, and also parse with the engine's own rules, which in Chromium drop `1,5` as
	 * empty - so no reader of a decimal-comma locale could type a fraction.
	 */
	function attributes() {
		const value = config.value();
		const min = config.min();
		// The numeric keypads phones show have no minus key, so a field that takes negatives gets the
		// full keyboard rather than one that cannot type them.
		const signed = min === undefined || min < 0;
		return {
			type: 'text',
			inputmode: signed ? 'text' : config.decimals() > 0 ? 'decimal' : 'numeric',
			role: 'spinbutton',
			'aria-valuenow': value,
			'aria-valuemin': config.min(),
			'aria-valuemax': config.max(),
			'aria-valuetext': value === undefined ? undefined : text(value),
			value: text(value)
		} as const;
	}

	return { commit, nudge, change, keydown, attributes };
}
