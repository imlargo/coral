/**
 * @coral/kit/number-input
 * @version 1.0.0
 */

import { render } from 'vitest-browser-svelte';
import { userEvent } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import NumberInput from './number-input.svelte';

const field = () => document.querySelector<HTMLInputElement>('input[type="number"]')!;
const decrease = () => document.querySelector<HTMLButtonElement>('button[aria-label="Decrease"]')!;
const increase = () => document.querySelector<HTMLButtonElement>('button[aria-label="Increase"]')!;

describe('the steppers', () => {
	it('step by `step` and report each press', async () => {
		const onchange = vi.fn();
		const props = $state({ value: 5 as number | undefined, step: 2, onchange });
		await render(NumberInput, props);

		await userEvent.click(increase());
		expect(props.value).toBe(7);
		await userEvent.click(decrease());
		await userEvent.click(decrease());
		expect(props.value).toBe(3);
		expect(onchange).toHaveBeenCalledTimes(3);
	});

	it('stop at the bounds, and are spent once the value gets there', async () => {
		const props = $state({ value: 9 as number | undefined, min: 0, max: 10 });
		await render(NumberInput, props);

		await userEvent.click(increase());
		expect(props.value).toBe(10);
		await expect.poll(() => increase().disabled).toBe(true);
		expect(decrease().disabled).toBe(false);
	});

	it('keep decimal steps exact', async () => {
		const props = $state({ value: 0 as number | undefined, step: 0.1 });
		await render(NumberInput, props);

		await userEvent.click(increase());
		await userEvent.click(increase());
		await userEvent.click(increase());
		expect(props.value).toBe(0.3);
	});

	it('start an empty field from zero, so `min` is the first stop and not the second', async () => {
		const props = $state({ value: undefined as number | undefined, min: 5 });
		await render(NumberInput, props);

		await userEvent.click(increase());
		expect(props.value).toBe(5);
	});

	it('do nothing while disabled or read only', async () => {
		const props = $state({ value: 5 as number | undefined, disabled: true, readonly: false });
		await render(NumberInput, props);
		expect(increase().disabled).toBe(true);
		expect(decrease().disabled).toBe(true);

		props.disabled = false;
		props.readonly = true;
		await expect.poll(() => increase().disabled).toBe(true);
	});
});

describe('typing', () => {
	it('is read on commit, and clamped to the bounds', async () => {
		const props = $state({ value: 4 as number | undefined, min: 0, max: 100 });
		await render(NumberInput, props);

		await userEvent.fill(field(), '150');
		await userEvent.tab();
		expect(props.value).toBe(100);
		expect(field().value).toBe('100');
	});

	it('rewrites the field even when the clamped number is the one already held', async () => {
		const props = $state({ value: 100 as number | undefined, max: 100 });
		await render(NumberInput, props);

		await userEvent.fill(field(), '150');
		await userEvent.tab();
		expect(field().value).toBe('100');
	});

	it('reads an empty field as no value, not as the smallest allowed one', async () => {
		const props = $state({ value: 4 as number | undefined, min: 1 });
		await render(NumberInput, props);

		await userEvent.clear(field());
		await userEvent.tab();
		expect(props.value).toBeUndefined();
	});

	it('rounds to the precision of the step', async () => {
		const props = $state({ value: 1 as number | undefined, step: 0.5 });
		await render(NumberInput, props);

		await userEvent.fill(field(), '2.26');
		await userEvent.tab();
		expect(props.value).toBe(2.3);
	});

	it('takes the precision from `decimals` when the step is coarser', async () => {
		const props = $state({ value: 1 as number | undefined, step: 1, decimals: 2 });
		await render(NumberInput, props);

		await userEvent.fill(field(), '2.256');
		await userEvent.tab();
		expect(props.value).toBe(2.26);
	});
});

describe('reporting', () => {
	it('never calls onchange for a value assigned from code', async () => {
		const onchange = vi.fn();
		const props = $state({ value: 1 as number | undefined, onchange });
		await render(NumberInput, props);

		props.value = 9;
		await expect.poll(() => field().value).toBe('9');
		expect(onchange).not.toHaveBeenCalled();
	});
});

describe('the wheel', () => {
	it('does not edit a focused field', async () => {
		const props = $state({ value: 5 as number | undefined });
		await render(NumberInput, props);

		field().focus();
		const event = new WheelEvent('wheel', { deltaY: -100, bubbles: true, cancelable: true });
		field().dispatchEvent(event);
		expect(event.defaultPrevented).toBe(true);
		expect(props.value).toBe(5);
	});

	it('leaves the page scrollable over a field that is not focused', async () => {
		await render(NumberInput, { value: 5 });
		const event = new WheelEvent('wheel', { deltaY: -100, bubbles: true, cancelable: true });
		field().dispatchEvent(event);
		expect(event.defaultPrevented).toBe(false);
	});
});

describe('the field', () => {
	it('shows a numeric keypad, with a decimal one when the step needs it', async () => {
		const props = $state({ value: 1 as number | undefined, step: 1 });
		await render(NumberInput, props);
		expect(field().inputMode).toBe('numeric');

		props.step = 0.25;
		await expect.poll(() => field().inputMode).toBe('decimal');
	});

	it('takes the labels for its buttons as props', async () => {
		await render(NumberInput, { value: 1, decrementLabel: 'Fewer', incrementLabel: 'More' });
		expect(document.querySelector('button[aria-label="Fewer"]')).not.toBeNull();
		expect(document.querySelector('button[aria-label="More"]')).not.toBeNull();
	});

	it('forwards what the input takes', async () => {
		await render(NumberInput, { value: 1, name: 'seats', id: 'seats', 'aria-label': 'Seats' });
		expect(field().name).toBe('seats');
		expect(field().id).toBe('seats');
		expect(field().getAttribute('aria-label')).toBe('Seats');
	});
});
