/**
 * @coral/kit/date-picker
 * @version 1.1.0
 */

/**
 * A shortcut in the popover: a label, and the value it selects.
 *
 * `value` may be a thunk, and for anything relative to now it has to be. A preset computed once
 * at module scope means a tab left open overnight still offers yesterday's "today" - the classic
 * bug in every hand-rolled preset row. The thunk is called when the list is rendered and again
 * when the preset is clicked, so both the highlight and the selection are computed from the clock
 * as it is now.
 */
export type Preset<Value> = {
	label: string;
	value: Value | (() => Value);
};

/** The value a preset stands for, right now. */
export function resolvePreset<Value>(preset: Preset<Value>): Value {
	return typeof preset.value === 'function' ? (preset.value as () => Value)() : preset.value;
}

/**
 * The preset the current selection came from, if any.
 *
 * This is the whole reason presets live in Coral rather than in a `{#each}` beside the calendar:
 * the row has to know which of its entries is the current one, and answering that means comparing
 * days rather than object identity - a preset hands back a fresh `CalendarDate` every call, so
 * `===` is always false.
 *
 * The first match wins. Two presets that resolve to the same value are the caller's to
 * disambiguate; Coral picking the later one would be arbitrary.
 */
export function activePreset<Value>(
	presets: Preset<Value>[],
	value: Value | undefined,
	equals: (a: Value | undefined, b: Value | undefined) => boolean
): Preset<Value> | undefined {
	if (value === undefined) return undefined;
	return presets.find((preset) => equals(resolvePreset(preset), value));
}
