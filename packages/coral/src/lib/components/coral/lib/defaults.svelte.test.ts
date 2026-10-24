/**
 * @coral/lib/defaults
 * @version 1.0.0
 */

import { render } from 'vitest-browser-svelte';
import { describe, expect, it } from 'vitest';
import Harness from './defaults-harness.test.svelte';

const trigger = () => document.querySelector('[data-slot="select-trigger"]')?.textContent?.trim();
const button = (label: string) =>
	Array.from(document.querySelectorAll('button')).find(
		(entry) => entry.textContent?.trim() === label
	);
const amount = () => document.querySelector<HTMLInputElement>('input[role="spinbutton"]')?.value;

describe('project-wide defaults', () => {
	it('fall through to English where nothing was stated', async () => {
		await render(Harness, {});
		expect(trigger()).toBe('Select an option...');
		await expect.poll(() => button('Cancel')).toBeDefined();
		expect(amount()).toBe('1.5');
	});

	it('reach every component rendered under them', async () => {
		await render(Harness, {
			defaults: {
				locale: 'es-CO',
				'kit/select': { placeholder: 'Selecciona una opción...' },
				'kit/confirm-dialog': { cancelLabel: 'Cancelar', confirmLabel: 'Continuar' }
			}
		});
		expect(trigger()).toBe('Selecciona una opción...');
		await expect.poll(() => button('Cancelar')).toBeDefined();
		expect(button('Continuar')).toBeDefined();
		// The locale is shared: a component with no copy of its own still formats in it.
		expect(amount()).toBe('1,5');
	});

	it('give way to a value passed at the call site', async () => {
		await render(Harness, {
			defaults: { 'kit/select': { placeholder: 'Selecciona...' } },
			placeholder: 'Pick a fruit'
		});
		expect(trigger()).toBe('Pick a fruit');
	});
});
