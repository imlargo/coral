/**
 * @coral/kit/number-input
 * @version 2.0.0
 */

import { render } from 'vitest-browser-svelte';
import { userEvent } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import NumberInput from './number-input.svelte';

const field = () => document.querySelector<HTMLInputElement>('input[role="spinbutton"]')!;
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

describe('the keyboard', () => {
	it('steps with the arrows, coarsely with Shift and with Page Up and Down', async () => {
		const props = $state({ value: 0 as number | undefined, step: 1, largeStep: 5 });
		await render(NumberInput, props);
		field().focus();

		await userEvent.keyboard('{ArrowUp}');
		expect(props.value).toBe(1);
		await userEvent.keyboard('{Shift>}{ArrowUp}{/Shift}');
		expect(props.value).toBe(6);
		await userEvent.keyboard('{PageDown}');
		expect(props.value).toBe(1);
	});

	it('goes to the bounds with Home and End', async () => {
		const props = $state({ value: 4 as number | undefined, min: 1, max: 9 });
		await render(NumberInput, props);
		field().focus();

		await userEvent.keyboard('{End}');
		expect(props.value).toBe(9);
		await userEvent.keyboard('{Home}');
		expect(props.value).toBe(1);
	});

	it('takes the first Escape to undo what is being typed', async () => {
		const props = $state({ value: 4 as number | undefined });
		await render(NumberInput, props);

		await userEvent.fill(field(), '47');
		await userEvent.keyboard('{Escape}');
		expect(field().value).toBe('4');
		expect(props.value).toBe(4);
	});
});

describe('the locale', () => {
	it('reads a decimal comma where the locale writes one, and shows the value that way', async () => {
		const props = $state({ value: 1 as number | undefined, step: 0.1, locale: 'de-DE' });
		await render(NumberInput, props);
		expect(field().value).toBe('1');

		await userEvent.fill(field(), '2,5');
		await userEvent.tab();
		expect(props.value).toBe(2.5);
		expect(field().value).toBe('2,5');
	});

	it('steps in the locale too', async () => {
		const props = $state({ value: 1.5 as number | undefined, step: 0.5, locale: 'fr-FR' });
		await render(NumberInput, props);
		await userEvent.click(increase());
		await expect.poll(() => field().value).toBe('2');
		await userEvent.click(increase());
		await expect.poll(() => field().value).toBe('2,5');
	});

	it('is announced as a spinbutton, with the value as the reader sees it', async () => {
		await render(NumberInput, { value: 2.5, step: 0.5, min: 0, max: 10, locale: 'de-DE' });
		expect(field().getAttribute('aria-valuenow')).toBe('2.5');
		expect(field().getAttribute('aria-valuetext')).toBe('2,5');
		expect(field().getAttribute('aria-valuemin')).toBe('0');
		expect(field().getAttribute('aria-valuemax')).toBe('10');
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
		await render(NumberInput, { value: 1, id: 'seats', 'aria-label': 'Seats', required: true });
		expect(field().id).toBe('seats');
		expect(field().getAttribute('aria-label')).toBe('Seats');
		expect(field().required).toBe(true);
	});

	it('submits the number, not the text the reader sees', async () => {
		await render(NumberInput, { value: 2.5, step: 0.5, name: 'price', locale: 'de-DE' });
		expect(field().name).toBe('');
		expect(document.querySelector<HTMLInputElement>('input[name="price"]')?.value).toBe('2.5');
	});
});
