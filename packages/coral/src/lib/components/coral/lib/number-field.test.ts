/**
 * @coral/lib/number-field
 * @version 1.1.0
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

/** A key press on a field holding `text`, with what the handler reads off the event. */
function pressed(key: string, text: string, extra: Partial<KeyboardEvent> = {}) {
	const input = { value: text } as HTMLInputElement;
	const event = {
		key,
		currentTarget: input,
		shiftKey: false,
		defaultPrevented: false,
		isComposing: false,
		preventDefault: vi.fn(),
		stopPropagation: vi.fn(),
		...extra
	} as unknown as KeyboardEvent & { currentTarget: HTMLInputElement };
	return { input, event };
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

	it('reads an empty field as no value', () => {
		const { state, onchange, field } = build(4);
		const { input, event } = typed('');
		field.change(event);
		expect(state.value).toBeUndefined();
		expect(input.value).toBe('');
		expect(onchange).toHaveBeenCalledWith(undefined);
	});

	it('reads and writes the number the way the locale does', () => {
		const { state, field } = build(4, { decimals: () => 1, locale: () => 'de-DE' });
		const { input, event } = typed('1,5');
		field.change(event);
		expect(state.value).toBe(1.5);
		expect(input.value).toBe('1,5');
	});
});

describe('text', () => {
	it('is the value in the locale, and empty for none', () => {
		const { field } = build(undefined, { decimals: () => 2, locale: () => 'es-CO' });
		expect(field.text()).toBe('');
		expect(field.text(2.5)).toBe('2,5');
	});
});

describe('keydown', () => {
	it('steps with the arrows, coarsely with Shift, and takes the key', () => {
		const { state, field } = build(2);
		const up = pressed('ArrowUp', '2');
		field.keydown(up.event);
		expect(state.value).toBe(3);
		expect(up.event.preventDefault).toHaveBeenCalled();

		field.keydown(pressed('ArrowDown', '3', { shiftKey: true }).event);
		expect(state.value).toBe(0);
	});

	it('pages by the large step and jumps to the bounds', () => {
		const { state, field } = build(2);
		field.keydown(pressed('PageUp', '2').event);
		expect(state.value).toBe(7);
		field.keydown(pressed('End', '7').event);
		expect(state.value).toBe(10);
		field.keydown(pressed('Home', '10').event);
		expect(state.value).toBe(0);
	});

	it('leaves Home and End to the caret when there is no bound to jump to', () => {
		const { state, field } = build(2, { min: () => undefined, max: () => undefined });
		const { event } = pressed('End', '2');
		field.keydown(event);
		expect(state.value).toBe(2);
		expect(event.preventDefault).not.toHaveBeenCalled();
	});

	it('puts the held value back on Escape, and keeps the key only when it did', () => {
		const { field } = build(2);
		const edited = pressed('Escape', '25');
		field.keydown(edited.event);
		expect(edited.input.value).toBe('2');
		expect(edited.event.stopPropagation).toHaveBeenCalled();

		const untouched = pressed('Escape', '2');
		field.keydown(untouched.event);
		expect(untouched.event.stopPropagation).not.toHaveBeenCalled();
	});

	it('does nothing while the field cannot be edited', () => {
		const { state, field } = build(2, { editable: () => false });
		field.keydown(pressed('ArrowUp', '2').event);
		expect(state.value).toBe(2);
	});
});

describe('commit', () => {
	it('is silent when nothing moved', () => {
		const { onchange, field } = build(5);
		field.commit(5);
		expect(onchange).not.toHaveBeenCalled();
	});
});
