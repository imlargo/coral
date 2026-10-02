/**
 * @coral/kit/rating-group
 * @version 1.0.0
 */

import { render } from 'vitest-browser-svelte';
import { userEvent } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import RatingGroup from './rating-group.svelte';

const radios = () => Array.from(document.querySelectorAll<HTMLInputElement>('input[type="radio"]'));
const radio = (value: number) => radios().find((entry) => entry.value === String(value))!;
/** What a pointer presses: the hit area around the radio. */
const target = (value: number) => radio(value).closest('label')!;
const group = () => document.querySelector<HTMLElement>('[role="radiogroup"], [role="img"]')!;

describe('picking', () => {
	it('draws one radio per star, and two per star when halves are allowed', async () => {
		await render(RatingGroup, { count: 5 });
		expect(radios()).toHaveLength(5);
	});

	it('draws two per star when halves are allowed', async () => {
		await render(RatingGroup, { count: 5, allowHalf: true });
		expect(radios()).toHaveLength(10);
		expect(
			radios()
				.map((entry) => entry.value)
				.slice(0, 3)
		).toEqual(['0.5', '1', '1.5']);
	});

	it('takes a star press, and reports it', async () => {
		const onchange = vi.fn();
		const props = $state({ value: 0, onchange });
		await render(RatingGroup, props);

		await userEvent.click(target(4));
		expect(props.value).toBe(4);
		expect(onchange).toHaveBeenCalledWith(4);
		expect(radio(4).checked).toBe(true);
	});

	it('picks the half a press landed on', async () => {
		const halves = $state({ value: 0, allowHalf: true });
		await render(RatingGroup, halves);

		await userEvent.click(target(2.5));
		expect(halves.value).toBe(2.5);
	});

	it('does not call onchange when the value is assigned from code', async () => {
		const onchange = vi.fn();
		const props = $state({ value: 1, onchange });
		await render(RatingGroup, props);

		props.value = 3;
		await expect.poll(() => radio(3).checked).toBe(true);
		expect(onchange).not.toHaveBeenCalled();
	});

	it('snaps a value that is not a step to the nearest one it can pick', async () => {
		await render(RatingGroup, { value: 3.4 });
		expect(radio(3).checked).toBe(true);
	});

	it('is blocked while disabled', async () => {
		await render(RatingGroup, { value: 2, disabled: true });
		expect(radios().every((entry) => entry.disabled)).toBe(true);
	});
});

describe('the keyboard', () => {
	it('moves with the arrows, because the radios share a group', async () => {
		const props = $state({ value: 2 });
		await render(RatingGroup, props);

		radio(2).focus();
		await userEvent.keyboard('{ArrowRight}');
		expect(props.value).toBe(3);
		await userEvent.keyboard('{ArrowLeft}{ArrowLeft}');
		expect(props.value).toBe(1);
	});

	it('jumps to either end with Home and End, which a radio group leaves out', async () => {
		const props = $state({ value: 3 });
		await render(RatingGroup, props);

		radio(3).focus();
		await userEvent.keyboard('{End}');
		expect(props.value).toBe(5);
		expect(document.activeElement).toBe(radio(5));
		await userEvent.keyboard('{Home}');
		expect(props.value).toBe(1);
		expect(document.activeElement).toBe(radio(1));
	});

	it('names every radio after the rating it stands for', async () => {
		await render(RatingGroup, { count: 3 });
		expect(radios().map((entry) => entry.getAttribute('aria-label'))).toEqual([
			'1 / 3',
			'2 / 3',
			'3 / 3'
		]);
	});

	it('takes the wording of that name from a function', async () => {
		await render(RatingGroup, {
			count: 3,
			label: (rating: number, total: number) => `${rating} of ${total} stars`
		});
		expect(radio(2).getAttribute('aria-label')).toBe('2 of 3 stars');
	});
});

describe('hovering', () => {
	it('previews the rating under the pointer, and reports it', async () => {
		const onhover = vi.fn();
		await render(RatingGroup, { value: 1, onhover });

		target(4).dispatchEvent(new PointerEvent('pointerenter'));
		expect(onhover).toHaveBeenCalledWith(4);

		group().dispatchEvent(new PointerEvent('pointerleave'));
		expect(onhover).toHaveBeenLastCalledWith(null);
	});
});

describe('read only', () => {
	it('reads as an image with the rating in its name, with nothing to press', async () => {
		await render(RatingGroup, { value: 3.5, readonly: true });
		expect(group().getAttribute('role')).toBe('img');
		expect(group().getAttribute('aria-label')).toBe('3.5 / 5');
		expect(radios()).toHaveLength(0);
	});

	it('draws a fraction as it is, not snapped to a step', async () => {
		await render(RatingGroup, { value: 3.7, readonly: true });
		const fills = Array.from(document.querySelectorAll<HTMLElement>('[style*="--coral-fill"]')).map(
			(entry) => Number.parseFloat(entry.style.getPropertyValue('--coral-fill'))
		);
		expect(fills).toHaveLength(4);
		expect(fills.slice(0, 3)).toEqual([100, 100, 100]);
		expect(fills[3]).toBeCloseTo(70, 5);
	});

	it('formats the number for the locale', async () => {
		await render(RatingGroup, { value: 3.5, readonly: true, locale: 'de-DE' });
		expect(group().getAttribute('aria-label')).toBe('3,5 / 5');
	});
});

describe('in a form', () => {
	it('submits under its name', async () => {
		document.body.insertAdjacentHTML('beforeend', '<form id="review"></form>');
		try {
			await render(RatingGroup, { value: 4, name: 'score', form: 'review' });
			const body = new FormData(document.getElementById('review') as HTMLFormElement);
			expect(body.get('score')).toBe('4');
		} finally {
			document.getElementById('review')?.remove();
		}
	});

	it('is never submitted without a name, though its radios still group', async () => {
		document.body.insertAdjacentHTML(
			'beforeend',
			'<form id="anon"><input name="x" value="1"></form>'
		);
		try {
			await render(RatingGroup, { value: 4 });
			const body = new FormData(document.getElementById('anon') as HTMLFormElement);
			expect([...body.keys()]).toEqual(['x']);
			expect(new Set(radios().map((entry) => entry.name)).size).toBe(1);
		} finally {
			document.getElementById('anon')?.remove();
		}
	});

	it('holds a required form up until a rating is picked', async () => {
		await render(RatingGroup, { value: 0, name: 'score', required: true });
		expect(radios().every((entry) => entry.required)).toBe(true);
		expect(radios()[0].checkValidity()).toBe(false);
	});
});
