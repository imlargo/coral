/**
 * @coral/kit/country-select
 * @version 1.0.0
 */

import { render } from 'vitest-browser-svelte';
import { userEvent } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import CountrySelect from './country-select.svelte';

const trigger = () => document.querySelector<HTMLButtonElement>('button[role="combobox"]')!;
const search = () => document.querySelector<HTMLInputElement>('[data-slot="command-input"]')!;
const options = () =>
	Array.from(
		document.querySelectorAll<HTMLElement>('[role="option"]:not([data-slot="coral-list-status"])')
	);
const option = (label: string) => options().find((entry) => entry.textContent?.includes(label))!;

describe('country select', () => {
	it('lists the countries asked for, named and sorted in the locale', async () => {
		await render(CountrySelect, { countries: ['DE', 'AT', 'CH'], locale: 'de-DE', open: true });

		await expect
			.poll(() => options().map((entry) => entry.querySelector('.truncate')?.textContent))
			.toEqual(['Deutschland', 'Österreich', 'Schweiz']);
	});

	it('finds a country by its English name and by its code', async () => {
		await render(CountrySelect, { countries: ['DE', 'FR'], locale: 'de-DE', open: true });

		await userEvent.fill(search(), 'germany');
		await expect.poll(() => options()).toHaveLength(1);
		await userEvent.fill(search(), 'fr');
		await expect.poll(() => option('Frankreich')).toBeTruthy();
	});

	it('binds the code and shows the picked country with its name spoken once', async () => {
		const props = $state({ value: undefined as string | undefined, countries: ['JP', 'KE'] });
		await render(CountrySelect, props);

		await userEvent.click(trigger());
		await userEvent.click(option('Kenya'));

		await expect.poll(() => props.value).toBe('KE');
		await expect
			.poll(() => trigger().querySelector('span[aria-hidden="true"]')?.textContent)
			.toBe('🇰🇪');
		expect(trigger().textContent).toContain('Kenya');
	});

	it('submits the code with its form', async () => {
		await render(CountrySelect, { value: 'JP', name: 'country' });
		expect(document.querySelector<HTMLInputElement>('input[name="country"]')?.value).toBe('JP');
	});
});
