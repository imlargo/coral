/**
 * @coral/kit/activity-calendar
 * @version 1.0.0
 */

import { render } from 'vitest-browser-svelte';
import { userEvent } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import ActivityCalendar from './activity-calendar.svelte';

const days = [
	{ date: '2026-01-05', count: 3 },
	{ date: '2026-01-06', count: 12 },
	{ date: '2026-01-14', count: 1 }
];
const range = { start: '2026-01-01', end: '2026-01-31' };

const squares = () => Array.from(document.querySelectorAll<HTMLButtonElement>('[data-day]'));
const square = (key: string) => document.querySelector<HTMLButtonElement>(`[data-day="${key}"]`)!;
const anchor = () =>
	document.querySelector<HTMLElement>('span[aria-hidden="true"].pointer-events-none.absolute')!;

describe('the grid', () => {
	it('draws a square for every day in the range, including empty ones', async () => {
		await render(ActivityCalendar, { data: days, ...range });
		expect(squares()).toHaveLength(31);
		expect(square('2026-01-05').dataset.level).not.toBe('0');
		expect(square('2026-01-20').dataset.level).toBe('0');
	});

	it('names every square with its count and day, so nothing needs a tooltip to be read', async () => {
		await render(ActivityCalendar, { data: days, ...range });
		expect(square('2026-01-06').getAttribute('aria-label')).toBe('12 · Jan 6, 2026');
	});

	it('takes the label wording as a function', async () => {
		await render(ActivityCalendar, {
			data: days,
			...range,
			label: (cell: { count: number }) => `${cell.count} contributions`
		});
		expect(square('2026-01-06').getAttribute('aria-label')).toBe('12 contributions');
	});

	it('follows the locale for the names of days and months', async () => {
		await render(ActivityCalendar, { data: days, ...range, locale: 'de-DE' });
		expect(square('2026-01-06').getAttribute('aria-label')).toContain('6. Jan. 2026');
	});
});

describe('the keyboard', () => {
	it('has one tab stop for the whole grid', async () => {
		await render(ActivityCalendar, { data: days, ...range });
		expect(squares().filter((entry) => entry.tabIndex === 0)).toHaveLength(1);
	});

	it('moves a day with up and down and a week with left and right', async () => {
		await render(ActivityCalendar, { data: days, ...range });

		square('2026-01-14').focus();
		await userEvent.keyboard('{ArrowDown}');
		expect(document.activeElement).toBe(square('2026-01-15'));
		await userEvent.keyboard('{ArrowRight}');
		expect(document.activeElement).toBe(square('2026-01-22'));
		await userEvent.keyboard('{ArrowLeft}{ArrowLeft}');
		expect(document.activeElement).toBe(square('2026-01-08'));
		await userEvent.keyboard('{ArrowUp}');
		expect(document.activeElement).toBe(square('2026-01-07'));
	});

	it('stops at the ends instead of wrapping', async () => {
		await render(ActivityCalendar, { data: days, ...range });

		square('2026-01-01').focus();
		await userEvent.keyboard('{ArrowUp}');
		expect(document.activeElement).toBe(square('2026-01-01'));
		await userEvent.keyboard('{End}');
		expect(document.activeElement).toBe(square('2026-01-31'));
		await userEvent.keyboard('{Home}');
		expect(document.activeElement).toBe(square('2026-01-01'));
	});

	it('points the horizontal arrows the other way in a right-to-left page', async () => {
		document.body.dir = 'rtl';
		try {
			await render(ActivityCalendar, { data: days, ...range });

			square('2026-01-14').focus();
			// The past is on the right in this page, so Right goes back.
			await userEvent.keyboard('{ArrowRight}');
			expect(document.activeElement).toBe(square('2026-01-07'));
			await userEvent.keyboard('{ArrowLeft}{ArrowLeft}');
			expect(document.activeElement).toBe(square('2026-01-21'));
		} finally {
			document.body.dir = '';
		}
	});
});

describe('selecting', () => {
	it('reports the cell that was pressed', async () => {
		const onselect = vi.fn();
		await render(ActivityCalendar, { data: days, ...range, onselect });

		await userEvent.click(square('2026-01-06'));
		expect(onselect).toHaveBeenCalledTimes(1);
		expect(onselect.mock.calls[0][0]).toMatchObject({ key: '2026-01-06', count: 12 });
	});
});

describe('the tooltip', () => {
	const hover = (key: string) =>
		square(key).dispatchEvent(new PointerEvent('pointerenter', { bubbles: false }));

	/** How far apart two boxes are, in whole pixels. */
	const apart = (a: DOMRect, b: DOMRect) =>
		Math.max(Math.abs(a.left - b.left), Math.abs(a.top - b.top));

	it('is parked exactly over the square that is hovered', async () => {
		await render(ActivityCalendar, { data: days, ...range });

		hover('2026-01-14');
		await expect.poll(() => anchor().style.getPropertyValue('--coral-width')).not.toBe('0px');
		expect(
			apart(anchor().getBoundingClientRect(), square('2026-01-14').getBoundingClientRect())
		).toBeLessThan(1);
	});

	it('stays parked over the square in a right-to-left page', async () => {
		document.body.dir = 'rtl';
		try {
			await render(ActivityCalendar, { data: days, ...range });

			hover('2026-01-14');
			await expect.poll(() => anchor().style.getPropertyValue('--coral-width')).not.toBe('0px');
			expect(
				apart(anchor().getBoundingClientRect(), square('2026-01-14').getBoundingClientRect())
			).toBeLessThan(1);
		} finally {
			document.body.dir = '';
		}
	});

	it('stays parked over the square once the scroller has been scrolled, in either direction', async () => {
		for (const dir of ['ltr', 'rtl']) {
			document.body.dir = dir;
			const view = await render(ActivityCalendar, {
				data: days,
				start: '2025-01-01',
				end: '2026-01-31',
				class: '[--coral-cell:--spacing(6)]',
				style: 'width: 240px'
			});
			try {
				const frame = document.querySelector<HTMLElement>('.overflow-x-auto')!;
				frame.scrollLeft = dir === 'rtl' ? -frame.scrollWidth / 3 : frame.scrollWidth / 3;
				await new Promise((resolve) => setTimeout(resolve, 30));

				const visible = squares().find((entry) => {
					const box = entry.getBoundingClientRect();
					const edge = frame.getBoundingClientRect();
					return box.left > edge.left + 20 && box.right < edge.right - 20;
				})!;
				visible.dispatchEvent(new PointerEvent('pointerenter', { bubbles: false }));
				await expect.poll(() => anchor().style.getPropertyValue('--coral-width')).not.toBe('0px');
				expect(
					apart(anchor().getBoundingClientRect(), visible.getBoundingClientRect())
				).toBeLessThan(1);
			} finally {
				view.unmount();
				document.body.dir = '';
			}
		}
	});
});
