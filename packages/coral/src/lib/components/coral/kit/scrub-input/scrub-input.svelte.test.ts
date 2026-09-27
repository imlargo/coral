/**
 * @coral/kit/scrub-input
 * @version 1.0.0
 */

import { render } from 'vitest-browser-svelte';
import { userEvent } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import ScrubInput from './scrub-input.svelte';

const field = () => document.querySelector<HTMLInputElement>('input[type="number"]')!;
const handle = () => document.querySelector<HTMLLabelElement>('label')!;

/**
 * A drag, as pointer events. Pointer lock never engages for synthetic events, so this exercises the
 * fallback path - which is also the one a browser that refuses the lock takes.
 */
async function drag(pixels: number, { shiftKey = false, steps = 4 } = {}) {
	const start = { pointerId: 1, button: 0, clientX: 100, bubbles: true };
	handle().dispatchEvent(new PointerEvent('pointerdown', start));

	for (let step = 1; step <= steps; step++) {
		handle().dispatchEvent(
			new PointerEvent('pointermove', {
				...start,
				clientX: 100 + (pixels * step) / steps,
				shiftKey
			})
		);
	}
	handle().dispatchEvent(new PointerEvent('pointerup', start));
	await vi.waitFor(() => expect(handle().dataset.scrubbing).toBeUndefined());
}

describe('dragging', () => {
	it('moves the value by one step per two pixels', async () => {
		const props = $state({ label: 'W', value: 100 });
		await render(ScrubInput, props);

		await drag(20);
		expect(props.value).toBe(110);
	});

	it('goes backwards too', async () => {
		const props = $state({ label: 'W', value: 100 });
		await render(ScrubInput, props);

		await drag(-20);
		expect(props.value).toBe(90);
	});

	it('takes the sensitivity it is given', async () => {
		const props = $state({ label: 'W', value: 0, pixelsPerStep: 1 });
		await render(ScrubInput, props);

		await drag(12);
		expect(props.value).toBe(12);
	});

	it('is coarse while Shift is held', async () => {
		const props = $state({ label: 'W', value: 0 });
		await render(ScrubInput, props);

		await drag(20, { shiftKey: true });
		expect(props.value).toBe(100);
	});

	it('does not lose a drag made a pixel at a time', async () => {
		const props = $state({ label: 'W', value: 0 });
		await render(ScrubInput, props);

		// Twelve moves of one pixel: rounding each on its own would leave the value untouched.
		await drag(12, { steps: 12 });
		expect(props.value).toBe(6);
	});

	it('holds the bounds', async () => {
		const props = $state({ label: 'W', value: 8, min: 0, max: 10 });
		await render(ScrubInput, props);

		await drag(40);
		expect(props.value).toBe(10);
	});

	it('brackets the drag with onscrubstart and onscrubend', async () => {
		const onscrubstart = vi.fn();
		const onscrubend = vi.fn();
		await render(ScrubInput, { label: 'W', value: 4, onscrubstart, onscrubend });

		await drag(20);
		expect(onscrubstart).toHaveBeenCalledExactlyOnceWith(4);
		expect(onscrubend).toHaveBeenCalledExactlyOnceWith(14);
	});

	it('gives the value back when Escape lands mid-drag', async () => {
		const props = $state({ label: 'W', value: 100 });
		await render(ScrubInput, props);

		const start = { pointerId: 1, button: 0, clientX: 100, bubbles: true };
		handle().dispatchEvent(new PointerEvent('pointerdown', start));
		handle().dispatchEvent(new PointerEvent('pointermove', { ...start, clientX: 140 }));
		expect(props.value).toBe(120);

		await userEvent.keyboard('{Escape}');
		expect(props.value).toBe(100);
	});

	it('does nothing while disabled', async () => {
		const props = $state({ label: 'W', value: 100, disabled: true });
		await render(ScrubInput, props);

		await drag(20);
		expect(props.value).toBe(100);
	});
});

describe('keyboard', () => {
	it('steps with the arrows, coarsely with Shift', async () => {
		const props = $state({ label: 'W', value: 10 });
		await render(ScrubInput, props);

		field().focus();
		await userEvent.keyboard('{ArrowUp}');
		expect(props.value).toBe(11);

		await userEvent.keyboard('{Shift>}{ArrowDown}{/Shift}');
		expect(props.value).toBe(1);
	});

	it('jumps to the bounds with Home and End', async () => {
		const props = $state({ label: 'W', value: 10, min: 0, max: 64 });
		await render(ScrubInput, props);

		field().focus();
		await userEvent.keyboard('{End}');
		expect(props.value).toBe(64);
		await userEvent.keyboard('{Home}');
		expect(props.value).toBe(0);
	});

	it('leaves the caret keys alone', async () => {
		const props = $state({ label: 'W', value: 10 });
		await render(ScrubInput, props);

		field().focus();
		await userEvent.keyboard('{ArrowLeft}{ArrowRight}');
		expect(props.value).toBe(10);
	});
});

describe('typing', () => {
	it('clamps on commit and rewrites what is on screen', async () => {
		const props = $state({ label: 'W', value: 10, min: 0, max: 64 });
		await render(ScrubInput, props);

		await userEvent.fill(field(), '150');
		field().blur();

		await expect.poll(() => props.value).toBe(64);
		expect(field().value).toBe('64');
	});

	it('is named by its own label', async () => {
		await render(ScrubInput, { label: 'Padding', value: 8 });
		expect(handle().htmlFor).toBe(field().id);
		expect(field().labels?.[0]?.textContent?.trim()).toBe('Padding');
	});
});
