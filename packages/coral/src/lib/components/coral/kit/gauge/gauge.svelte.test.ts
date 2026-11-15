/**
 * @coral/kit/gauge
 * @version 1.0.0
 */

import { render } from 'vitest-browser-svelte';
import { createRawSnippet } from 'svelte';
import { describe, expect, it } from 'vitest';
import Gauge from './gauge.svelte';

const meter = () => document.querySelector<HTMLElement>('[role="meter"]')!;
const fill = () => meter().querySelectorAll('path')[1] as SVGPathElement | undefined;

describe('reading', () => {
	it('is a meter with its range and the text it shows', async () => {
		await render(Gauge, { value: 42, 'aria-label': 'Disk used' });
		expect(meter().getAttribute('aria-valuenow')).toBe('42');
		expect(meter().getAttribute('aria-valuemin')).toBe('0');
		expect(meter().getAttribute('aria-valuemax')).toBe('100');
		expect(meter().getAttribute('aria-valuetext')).toBe('42');
		expect(meter().textContent?.trim()).toBe('42');
	});

	it('writes the value in the locale and format it is given', async () => {
		await render(Gauge, {
			value: 0.375,
			max: 1,
			locale: 'de-DE',
			format: { style: 'percent', maximumFractionDigits: 1 }
		});
		// German puts a no-break space before the sign.
		expect(meter().getAttribute('aria-valuetext')).toMatch(/^37,5\s%$/);
	});

	it('fills the arc to the fraction, clamped, while the text says the real value', async () => {
		await render(Gauge, { value: 130 });
		expect(fill()?.getAttribute('stroke-dasharray')).toBe('100 100');
		expect(meter().getAttribute('aria-valuenow')).toBe('100');
		expect(meter().getAttribute('aria-valuetext')).toBe('130');
	});

	it('draws no fill at all for an empty reading', async () => {
		await render(Gauge, { value: 0 });
		expect(fill()).toBeUndefined();
	});

	it('follows the value as it changes', async () => {
		const props = $state({ value: 20 });
		await render(Gauge, props);

		props.value = 60;
		await expect.poll(() => fill()?.getAttribute('stroke-dasharray')).toBe('60 100');
		expect(meter().getAttribute('aria-valuenow')).toBe('60');
	});

	it('lets a caller word the reading for a screen reader', async () => {
		await render(Gauge, { value: 12, max: 20, 'aria-valuetext': '12 of 20 seats' });
		expect(meter().getAttribute('aria-valuetext')).toBe('12 of 20 seats');
	});
});

describe('the middle', () => {
	it('hands a snippet the value, the fraction and the text', async () => {
		const children = createRawSnippet((context: () => { fraction: number; text: string }) => ({
			render: () => `<b>${context().text} · ${context().fraction}</b>`
		}));
		await render(Gauge, { value: 25, children });
		expect(meter().querySelector('b')?.textContent).toBe('25 · 0.25');
	});
});
