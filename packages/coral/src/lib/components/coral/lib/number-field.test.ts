/**
 * @coral/lib/number-field
 * @version 1.0.0
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
		decimals: () => 0,
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
});

describe('commit', () => {
	it('is silent when nothing moved', () => {
		const { onchange, field } = build(5);
		field.commit(5);
		expect(onchange).not.toHaveBeenCalled();
	});
});
