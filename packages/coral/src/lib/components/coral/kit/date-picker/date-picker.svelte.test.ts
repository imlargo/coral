/**
 * @coral/kit/date-picker
 * @version 1.0.0
 */

import { render } from 'vitest-browser-svelte';
import type { ComponentProps } from 'svelte';
import { CalendarDate } from '@internationalized/date';
import { userEvent } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import DatePicker from './date-picker.svelte';

/** A fixed month on screen, so the days the tests press are always there. */
const january = new CalendarDate(2026, 1, 1);

const draw = (props: Record<string, unknown>) =>
	render(DatePicker, props as unknown as ComponentProps<typeof DatePicker>);

const trigger = () => document.querySelector<HTMLButtonElement>('button[aria-haspopup="dialog"]')!;
const day = (iso: string) =>
	document.querySelector<HTMLElement>(`[data-value="${iso}"] [data-bits-day]`)!;
const calendar = () => document.querySelector('[data-calendar-header]');
const button = (label: string) =>
	Array.from(document.querySelectorAll('button')).find(
		(entry) => entry.textContent?.trim() === label || entry.getAttribute('aria-label') === label
	) as HTMLButtonElement | undefined;
const field = (name: string) => document.querySelector<HTMLInputElement>(`input[name="${name}"]`);

describe('one day', () => {
	it('shows the placeholder until a day is picked', async () => {
		await draw({ placeholder: 'Pick a day' });
		expect(trigger().textContent?.trim()).toBe('Pick a day');
	});

	it('picks a day, reports it, prints it and closes', async () => {
		const onchange = vi.fn();
		const props = $state({
			value: undefined as CalendarDate | undefined,
			month: january,
			onchange
		});
		await draw(props);

		await userEvent.click(trigger());
		await userEvent.click(day('2026-01-15'));

		await expect.poll(() => props.value?.toString()).toBe('2026-01-15');
		expect(onchange).toHaveBeenCalledTimes(1);
		await expect.poll(() => trigger().textContent?.trim()).toBe('Jan 15, 2026');
		await expect.poll(calendar).toBeNull();
		await expect.poll(() => document.activeElement).toBe(trigger());
	});

	it('does not call onchange when the value is assigned from code', async () => {
		const onchange = vi.fn();
		const props = $state({ value: undefined as CalendarDate | undefined, onchange });
		await draw(props);

		props.value = new CalendarDate(2026, 3, 9);
		await expect.poll(() => trigger().textContent?.trim()).toBe('Mar 9, 2026');
		expect(onchange).not.toHaveBeenCalled();
	});

	it('formats in the locale and the style it is given', async () => {
		await draw({
			value: new CalendarDate(2026, 3, 9),
			locale: 'de-DE',
			format: { dateStyle: 'long' }
		});
		expect(trigger().textContent?.trim()).toBe('9. März 2026');
	});

	it('shows the day that was picked, not the day before, across a daylight saving jump', async () => {
		await draw({ value: new CalendarDate(2026, 3, 29), format: { dateStyle: 'full' } });
		expect(trigger().textContent).toContain('29');
		expect(trigger().textContent).toContain('Sunday');
	});
});

describe('a range', () => {
	it('stays open and silent after the first click, and completes on the second', async () => {
		const onchange = vi.fn();
		const props = $state({
			type: 'range' as const,
			value: undefined as { start?: CalendarDate; end?: CalendarDate } | undefined,
			month: january,
			open: true,
			onchange
		});
		await draw(props);

		await userEvent.click(day('2026-01-05'));
		await expect.poll(() => props.value?.start?.toString()).toBe('2026-01-05');
		expect(props.open).toBe(true);
		expect(onchange).not.toHaveBeenCalled();

		await userEvent.click(day('2026-01-09'));
		await expect.poll(() => props.open).toBe(false);
		expect(onchange).toHaveBeenCalledTimes(1);
		expect(props.value?.end?.toString()).toBe('2026-01-09');
	});

	it('folds what the two ends share into one label', async () => {
		await draw({
			type: 'range',
			value: { start: new CalendarDate(2026, 1, 5), end: new CalendarDate(2026, 1, 9) }
		});
		expect(trigger().textContent?.replace(/\s/g, ' ')).toMatch(/Jan 5\s*[–-]\s*9, 2026/);
	});

	it('does not read a half-picked range as empty', async () => {
		await draw({
			type: 'range',
			placeholder: 'Pick a period',
			value: { start: new CalendarDate(2026, 1, 5), end: undefined }
		});
		expect(trigger().textContent?.trim()).toBe('Jan 5, 2026');
	});
});

describe('presets', () => {
	const presets = [
		{ label: 'New Year', value: () => new CalendarDate(2026, 1, 1) },
		{ label: 'Mid month', value: new CalendarDate(2026, 1, 15) }
	];

	it('picks what a preset stands for, and closes', async () => {
		const onchange = vi.fn();
		const props = $state({
			presets,
			value: undefined as CalendarDate | undefined,
			open: true,
			onchange
		});
		await draw(props);

		await userEvent.click(button('Mid month')!);
		await expect.poll(() => props.value?.toString()).toBe('2026-01-15');
		expect(onchange).toHaveBeenCalledTimes(1);
		await expect.poll(() => props.open).toBe(false);
	});

	it('prints the preset that was chosen rather than the date it stands for', async () => {
		await draw({ presets, value: new CalendarDate(2026, 1, 15) });
		expect(trigger().textContent?.trim()).toBe('Mid month');
	});

	it('marks the active preset as pressed', async () => {
		await draw({ presets, value: new CalendarDate(2026, 1, 1), open: true });
		// The trigger reads "New Year" too, so only the buttons that can be pressed are looked at.
		const pressed = Array.from(document.querySelectorAll('[aria-pressed]')).map((entry) => [
			entry.textContent?.trim(),
			entry.getAttribute('aria-pressed')
		]);
		expect(pressed).toEqual([
			['New Year', 'true'],
			['Mid month', 'false']
		]);
	});
});

describe('clearing', () => {
	it('clears from the control beside the trigger, and reports it', async () => {
		const onchange = vi.fn();
		const props = $state({
			value: new CalendarDate(2026, 1, 15) as CalendarDate | undefined,
			clearable: true,
			onchange
		});
		await draw(props);

		await userEvent.click(button('Clear date')!);
		await expect.poll(() => props.value).toBeUndefined();
		expect(onchange).toHaveBeenCalledWith(undefined);
	});

	it('offers no clear control while nothing is selected', async () => {
		await draw({ clearable: true });
		expect(button('Clear date')).toBeUndefined();
	});
});

describe('in a form', () => {
	it('submits nothing without a name', async () => {
		await draw({ value: new CalendarDate(2026, 1, 15) });
		expect(document.querySelector('input[name]')).toBeNull();
	});

	it('submits the ISO day', async () => {
		await draw({ value: new CalendarDate(2026, 1, 15), name: 'due' });
		expect(field('due')?.value).toBe('2026-01-15');
	});

	it('submits both ends of a range, under `name` and `endName`', async () => {
		await draw({
			type: 'range',
			name: 'period',
			endName: 'period-until',
			value: { start: new CalendarDate(2026, 1, 5), end: new CalendarDate(2026, 1, 9) }
		});
		expect(field('period')?.value).toBe('2026-01-05');
		expect(field('period-until')?.value).toBe('2026-01-09');
	});

	it('names the second end after the first when `endName` is left out', async () => {
		await draw({ type: 'range', name: 'period', value: undefined });
		expect(field('period-end')).not.toBeNull();
	});

	it('holds a required form up while empty, and for a half-picked range', async () => {
		await draw({ name: 'due', required: true });
		expect(field('due')?.checkValidity()).toBe(false);
	});

	it('holds a required range up while only one end is picked', async () => {
		await draw({
			type: 'range',
			name: 'period',
			required: true,
			value: { start: new CalendarDate(2026, 1, 5), end: undefined }
		});
		expect(field('period-end')?.checkValidity()).toBe(false);
	});

	it('runs the day through serialize', async () => {
		await draw({
			value: new CalendarDate(2026, 1, 15),
			name: 'due',
			serialize: (value: CalendarDate) => `${value.day}/${value.month}/${value.year}`
		});
		expect(field('due')?.value).toBe('15/1/2026');
	});
});

describe('the trigger', () => {
	it('hands the button what a field wires through it', async () => {
		await draw({
			id: 'due-field',
			'aria-label': 'Due date',
			'aria-describedby': 'due-hint',
			'aria-invalid': true
		});
		expect(trigger().id).toBe('due-field');
		expect(trigger().getAttribute('aria-label')).toBe('Due date');
		expect(trigger().getAttribute('aria-describedby')).toBe('due-hint');
		expect(trigger().getAttribute('aria-invalid')).toBe('true');
	});

	it('keeps the id the popover gave it when none is passed', async () => {
		await draw({});
		expect(trigger().id).not.toBe('');
	});

	it('is blocked while disabled', async () => {
		await draw({ disabled: true });
		expect(trigger().disabled).toBe(true);
	});
});
