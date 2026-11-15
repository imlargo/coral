/**
 * @coral/kit/color-picker
 * @version 1.0.0
 */

import { render } from 'vitest-browser-svelte';
import { userEvent } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import ColorPanel from './color-panel.svelte';
import ColorPicker from './color-picker.svelte';

const sliders = () => Array.from(document.querySelectorAll<HTMLElement>('[role="slider"]'));
const area = () => sliders()[0];
const hue = () => sliders()[1];
const field = () => document.querySelector<HTMLInputElement>('input[aria-label="Hex"]')!;
const swatch = (label: string) =>
	document.querySelector<HTMLInputElement>(`input[type="radio"][aria-label="${label}"]`)!;

describe('the panel', () => {
	it('places the thumbs where the value is', async () => {
		await render(ColorPanel, { value: '#ff0000' });
		expect(area().getAttribute('aria-valuenow')).toBe('100');
		expect(area().getAttribute('aria-valuetext')).toBe('Saturation 100%, brightness 100%');
		expect(hue().getAttribute('aria-valuenow')).toBe('0');
		expect(hue().getAttribute('aria-valuetext')).toBe('0 degrees');
		expect(field().value).toBe('#ff0000');
	});

	it('moves saturation and brightness from the keyboard, reporting each press', async () => {
		const onchange = vi.fn();
		const props = $state({ value: '#ff0000', onchange });
		await render(ColorPanel, props);

		area().focus();
		await userEvent.keyboard('{ArrowDown}');
		expect(area().getAttribute('aria-valuetext')).toBe('Saturation 100%, brightness 99%');
		expect(props.value).toBe('#fc0000');
		expect(onchange).toHaveBeenLastCalledWith('#fc0000');
	});

	it('moves the hue from the keyboard', async () => {
		const props = $state({ value: '#ff0000' });
		await render(ColorPanel, props);

		hue().focus();
		await userEvent.keyboard('{End}');
		expect(hue().getAttribute('aria-valuenow')).toBe('360');
		expect(props.value).toBe('#ff0000');
	});

	it('keeps the hue when the square reaches grey', async () => {
		const props = $state({ value: '#3b82f6' });
		await render(ColorPanel, props);
		const before = hue().getAttribute('aria-valuenow');

		area().focus();
		await userEvent.keyboard('{Home}');
		expect(props.value).toMatch(/^#([\da-f]{2})\1\1$/);
		expect(hue().getAttribute('aria-valuenow')).toBe(before);
	});

	it('takes a typed hex on Enter, in any spelling', async () => {
		const onchange = vi.fn();
		const props = $state({ value: '#ff0000', onchange });
		await render(ColorPanel, props);

		await userEvent.clear(field());
		await userEvent.type(field(), '38F{Enter}');
		expect(props.value).toBe('#3388ff');
		expect(onchange).toHaveBeenCalledWith('#3388ff');
		expect(field().value).toBe('#3388ff');
	});

	it('puts back the value when a typed hex is not one', async () => {
		const onchange = vi.fn();
		const props = $state({ value: '#ff0000', onchange });
		await render(ColorPanel, props);

		await userEvent.clear(field());
		await userEvent.type(field(), 'blue');
		field().blur();
		await expect.poll(() => field().value).toBe('#ff0000');
		expect(onchange).not.toHaveBeenCalled();
	});

	it('takes the first Escape to undo a half-typed hex, and lets the next one through', async () => {
		const escapes = vi.fn();
		const outside = (event: KeyboardEvent) => event.key === 'Escape' && escapes();
		document.addEventListener('keydown', outside);
		try {
			await render(ColorPanel, { value: '#ff0000' });
			await userEvent.clear(field());
			await userEvent.type(field(), '12');
			await userEvent.keyboard('{Escape}');
			expect(field().value).toBe('#ff0000');
			expect(escapes).not.toHaveBeenCalled();

			await userEvent.keyboard('{Escape}');
			expect(escapes).toHaveBeenCalledTimes(1);
		} finally {
			document.removeEventListener('keydown', outside);
		}
	});

	it('picks a swatch, named by its label', async () => {
		const onchange = vi.fn();
		const props = $state({
			value: '#ff0000',
			onchange,
			swatches: ['#16a34a', { value: '#2563eb', label: 'Blue' }]
		});
		await render(ColorPanel, props);

		await userEvent.click(swatch('Blue').closest('label')!);
		expect(props.value).toBe('#2563eb');
		expect(onchange).toHaveBeenCalledWith('#2563eb');
		expect(swatch('Blue').checked).toBe(true);
		expect(swatch('#16a34a').checked).toBe(false);
	});

	it('does not report a value assigned from code', async () => {
		const onchange = vi.fn();
		const props = $state({ value: '#ff0000', onchange });
		await render(ColorPanel, props);

		props.value = '#00ff00';
		await expect.poll(() => field().value).toBe('#00ff00');
		expect(hue().getAttribute('aria-valuenow')).toBe('120');
		expect(onchange).not.toHaveBeenCalled();
	});
});

describe('reporting', () => {
	it('reports a pick again after code assigned something else in between', async () => {
		const onchange = vi.fn();
		const props = $state({ value: '#ff0000', onchange, swatches: ['#2563eb'] });
		await render(ColorPanel, props);

		await userEvent.click(swatch('#2563eb').closest('label')!);
		props.value = '#16a34a';
		await expect.poll(() => field().value).toBe('#16a34a');
		await userEvent.click(swatch('#2563eb').closest('label')!);
		expect(onchange).toHaveBeenCalledTimes(2);
	});
});

describe('the picker', () => {
	it('prints the colour on the trigger, or the placeholder', async () => {
		const props = $state<{ value?: string; 'aria-label': string }>({ 'aria-label': 'Brand' });
		await render(ColorPicker, props);
		const trigger = document.querySelector('button')!;
		expect(trigger.textContent?.trim()).toBe('Pick a colour');

		props.value = '#3B82F6';
		await expect.poll(() => trigger.textContent?.trim()).toBe('#3b82f6');
	});

	it('opens on the square, ready for the arrow keys', async () => {
		await render(ColorPicker, { value: '#3b82f6', 'aria-label': 'Brand' });
		await userEvent.click(document.querySelector('button')!);
		await expect.poll(() => document.activeElement?.getAttribute('role')).toBe('slider');
	});

	it('keeps the hue of a grey when the popover opens again', async () => {
		const props = $state({ value: '#3b82f6', open: true, 'aria-label': 'Brand' });
		await render(ColorPicker, props);
		await expect.poll(() => sliders().length).toBe(2);
		const before = hue().getAttribute('aria-valuenow');

		area().focus();
		await userEvent.keyboard('{Home}');
		props.open = false;
		await expect.poll(() => sliders().length).toBe(0);
		props.open = true;
		await expect.poll(() => sliders().length).toBe(2);
		expect(hue().getAttribute('aria-valuenow')).toBe(before);
	});

	it('submits the hex under its name', async () => {
		await render(ColorPicker, { value: '#3b82f6', name: 'brand', 'aria-label': 'Brand' });
		const submitted = document.querySelector<HTMLInputElement>('input[name="brand"]')!;
		expect(submitted.value).toBe('#3b82f6');
	});
});
