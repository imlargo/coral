/**
 * @coral/lib/number-field
 * @version 2.0.0
 */

import { describe, expect, it, vi } from 'vitest';
import { numberField } from './number-field.js';
import type { NumberFieldConfig } from './number-field.js';

function build(initial: number | undefined, overrides: Partial<NumberFieldConfig> = {}) {
	const state = { value: initial };
	const onchange = vi.fn();
	const field = numberField({
		value: () => state.value,
		set: (next) => (state.value = next),
		min: () => 0,
		max: () => 10,
		step: () => 1,
		largeStep: () => 5,
		decimals: () => 0,
		locale: () => 'en-US',
		editable: () => true,
		onchange: () => onchange,
		...overrides
	});
	return { state, onchange, field };
}

/** The part of an input event the handler reads. */
function typed(text: string) {
	const input = { value: text } as HTMLInputElement;
	return { input, event: { currentTarget: input } as Event & { currentTarget: HTMLInputElement } };
}

/** The part of a keydown the handler reads, and whether it was taken. */
function pressed(key: string, { shiftKey = false, text = '' } = {}) {
	const input = { value: text } as HTMLInputElement;
	const event = {
		key,
		shiftKey,
		currentTarget: input,
		defaultPrevented: false,
		preventDefault() {
			this.defaultPrevented = true;
		},
		stopPropagation: vi.fn()
	};
	return { input, event: event as unknown as KeyboardEvent & { currentTarget: HTMLInputElement } };
}

describe('nudge', () => {
	it('steps, clamps and reports', () => {
		const { state, onchange, field } = build(9);
		field.nudge(1);
		expect(state.value).toBe(10);
		field.nudge(1);
		expect(state.value).toBe(10);
		expect(onchange).toHaveBeenCalledTimes(1);
		expect(onchange).toHaveBeenCalledWith(10);
	});

	it('does nothing while the field cannot be edited', () => {
		const { state, onchange, field } = build(3, { editable: () => false });
		field.nudge(1);
		expect(state.value).toBe(3);
		expect(onchange).not.toHaveBeenCalled();
	});

	it('keeps decimal steps exact', () => {
		const { state, field } = build(0.1, { decimals: () => 1 });
		field.nudge(0.2);
		expect(state.value).toBe(0.3);
	});
});

describe('change', () => {
	it('reads what was typed, clamped, and writes the clamped text back', () => {
		const { state, field } = build(4);
		const { input, event } = typed('150');
		field.change(event);
		expect(state.value).toBe(10);
		expect(input.value).toBe('10');
	});

	it('rewrites the text even when the clamped number is the one already held', () => {
		const { onchange, field } = build(10);
		const { input, event } = typed('150');
		field.change(event);
		expect(onchange).not.toHaveBeenCalled();
		expect(input.value).toBe('10');
	});

	it('reads the decimal comma of a locale that writes one, and writes it back', () => {
		const { state, field } = build(1, { decimals: () => 1, locale: () => 'de-DE' });
		const { input, event } = typed('2,5');
		field.change(event);
		expect(state.value).toBe(2.5);
		expect(input.value).toBe('2,5');
	});

	it('reads an empty field as no value', () => {
		const { state, onchange, field } = build(4);
		const { input, event } = typed('');
		field.change(event);
		expect(state.value).toBeUndefined();
		expect(input.value).toBe('');
		expect(onchange).toHaveBeenCalledWith(undefined);
	});
});

describe('commit', () => {
	it('is silent when nothing moved', () => {
		const { onchange, field } = build(5);
		field.commit(5);
		expect(onchange).not.toHaveBeenCalled();
	});
});

describe('keydown', () => {
	it('steps with the arrows, coarsely with Shift and with Page Up and Down', () => {
		const { state, field } = build(0, { max: () => 100 });
		field.keydown(pressed('ArrowUp').event);
		expect(state.value).toBe(1);
		field.keydown(pressed('ArrowUp', { shiftKey: true }).event);
		expect(state.value).toBe(6);
		field.keydown(pressed('PageDown').event);
		expect(state.value).toBe(1);
	});

	it('goes to a bound with Home and End, and leaves the key alone without one', () => {
		const { state, field } = build(4, { max: () => undefined });
		field.keydown(pressed('Home').event);
		expect(state.value).toBe(0);

		const end = pressed('End').event;
		field.keydown(end);
		expect(state.value).toBe(0);
		expect(end.defaultPrevented).toBe(false);
	});

	it('takes the first Escape to undo the edit, and lets the second through', () => {
		const { field } = build(4);
		const { input, event } = pressed('Escape', { text: '47' });
		field.keydown(event);
		expect(input.value).toBe('4');
		expect(event.stopPropagation).toHaveBeenCalled();

		const again = pressed('Escape', { text: '4' });
		field.keydown(again.event);
		expect(again.event.stopPropagation).not.toHaveBeenCalled();
	});

	it('does nothing while the field cannot be edited', () => {
		const { state, field } = build(4, { editable: () => false });
		field.keydown(pressed('ArrowUp').event);
		expect(state.value).toBe(4);
	});
});

describe('attributes', () => {
	it('announces a text field as a spinbutton, with the value written in the locale', () => {
		const { field } = build(2.5, { decimals: () => 1, locale: () => 'de-DE' });
		expect(field.attributes()).toMatchObject({
			type: 'text',
			inputmode: 'decimal',
			role: 'spinbutton',
			'aria-valuenow': 2.5,
			'aria-valuemin': 0,
			'aria-valuemax': 10,
			'aria-valuetext': '2,5',
			value: '2,5'
		});
	});
});
