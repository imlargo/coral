/**
 * @coral/lib/defaults
 * @version 1.0.0
 */

import { render } from 'vitest-browser-svelte';
import type { Component } from 'svelte';
import { describe, expect, it } from 'vitest';
import Harness from './defaults-harness.test.svelte';
import Combobox from '../kit/combobox/combobox.svelte';
import RelativeTime from '../kit/relative-time/relative-time.svelte';
import type { Defaults } from './defaults.js';

/** The harness renders any component, so it takes them untyped. */
const untyped = (component: unknown) => component as Component<Record<string, unknown>>;

const fruits = [{ value: 'kiwi', label: 'Kiwi' }];
const now = new Date('2026-06-15T12:00:00Z');
const fiveMinutesAgo = new Date(now.getTime() - 5 * 60_000);

const trigger = () => document.querySelector<HTMLButtonElement>('button[role="combobox"]')!;
const time = () => document.querySelector('time')!.textContent?.trim();

const combobox = (layers: Defaults[], props: Record<string, unknown> = {}) =>
	render(Harness, { layers, component: untyped(Combobox), values: { options: fruits, ...props } });

describe('setDefaults', () => {
	it("replaces a component's English default", async () => {
		await combobox([{ 'kit/combobox': { placeholder: 'Choisir une option...' } }]);
		expect(trigger().textContent?.trim()).toBe('Choisir une option...');
	});

	it('loses to a prop passed at the call site', async () => {
		await combobox([{ 'kit/combobox': { placeholder: 'Choisir une option...' } }], {
			placeholder: 'Pick a fruit'
		});
		expect(trigger().textContent?.trim()).toBe('Pick a fruit');
	});

	it('keeps the English default under an entry set to undefined', async () => {
		await combobox([{ 'kit/combobox': { placeholder: undefined } }]);
		expect(trigger().textContent?.trim()).toBe('Select an option...');
	});

	it('hands its locale to every component that formats', async () => {
		await render(Harness, {
			layers: [{ locale: 'fr-FR' }],
			component: untyped(RelativeTime),
			values: { date: fiveMinutesAgo, now }
		});
		expect(time()).toBe('il y a 5 minutes');
	});

	it("lets a component's own entry choose another locale", async () => {
		await render(Harness, {
			layers: [{ locale: 'fr-FR', 'kit/relative-time': { locale: 'de-DE' } }],
			component: untyped(RelativeTime),
			values: { date: fiveMinutesAgo, now }
		});
		expect(time()).toBe('vor 5 Minuten');
	});

	it('merges a nested call into the one above it, entry by entry', async () => {
		const layers: Defaults[] = [
			{ 'kit/combobox': { placeholder: 'Choisir une option...', clearLabel: 'Effacer' } },
			{ 'kit/combobox': { clearLabel: 'Vider' } }
		];

		const first = await combobox(layers);
		expect(trigger().textContent?.trim()).toBe('Choisir une option...');
		first.unmount();

		await combobox(layers, { value: 'kiwi', clearable: true });
		expect(document.querySelector('[aria-label="Vider"]')).not.toBeNull();
	});
});
