/**
 * @coral/kit/select
 * @version 2.1.0
 */

import { render } from 'vitest-browser-svelte';
import { describe, expect, it } from 'vitest';
import Select from './select.svelte';
import type { Option } from '../../lib/options.js';

const cities: Option<number>[] = [
	{ value: 11001, label: 'Bogotá' },
	{ value: 5001, label: 'Medellín' }
];

/** The field Coral submits with, as the DOM sees it. */
function field(name = 'city'): HTMLInputElement {
	const found = document.querySelector<HTMLInputElement>(`input[name="${name}"]`);
	if (!found) throw new Error(`no field named ${name}`);
	return found;
}

describe('form participation', () => {
	it('submits nothing at all without a name', () => {
		render(Select, { options: cities });
		expect(document.querySelector('input[name]')).toBeNull();
	});

	it('writes the value, not the internal item key', () => {
		render(Select, { options: cities, name: 'city', value: 5001 });
		// 5001 is the option's own value; `1` would be its index in the list.
		expect(field().value).toBe('5001');
	});

	it('writes an empty field while nothing is selected', () => {
		render(Select, { options: cities, name: 'city' });
		expect(field().value).toBe('');
	});

	it('runs the value through serialize', () => {
		// The same reference on both sides, because an object value is matched with `===` - which is
		// the other half of why `serialize` has to exist for one.
		const thing = { id: 7 };
		render(Select, {
			options: [{ value: thing, label: 'Seven' }],
			name: 'thing',
			value: thing,
			// `render` takes a props object, so it cannot infer the component's `T` and lands on
			// `unknown`. The cast belongs to the harness, not to the component's own typing.
			serialize: (entry) => String((entry as { id: number }).id)
		});
		expect(field('thing').value).toBe('7');
	});

	it('associates with a form by id, for a select rendered outside it', () => {
		render(Select, { options: cities, name: 'city', form: 'filters' });
		expect(field().getAttribute('form')).toBe('filters');
	});

	/**
	 * The regression this whole mechanism exists for.
	 *
	 * `willValidate` is exactly what a `type="hidden"` field gets wrong: hidden inputs are barred
	 * from constraint validation, so the old field reported `false` here and `required` on the
	 * select did nothing whatsoever. Nothing else in the DOM distinguishes the two cases.
	 */
	it('is a control the browser will actually validate', () => {
		render(Select, { options: cities, name: 'city', required: true });
		expect(field().willValidate).toBe(true);
	});

	it('reports an empty required select as missing', () => {
		render(Select, { options: cities, name: 'city', required: true });
		expect(field().validity.valueMissing).toBe(true);
	});

	it('is satisfied once something is selected', () => {
		render(Select, { options: cities, name: 'city', required: true, value: 11001 });
		expect(field().checkValidity()).toBe(true);
	});

	it('stays out of the tab order and the accessibility tree', () => {
		render(Select, { options: cities, name: 'city' });
		expect([field().tabIndex, field().getAttribute('aria-hidden')]).toEqual([-1, 'true']);
	});

	it('announces the requirement on the trigger, which is what gets focus', () => {
		render(Select, { options: cities, name: 'city', required: true });
		const trigger = document.querySelector('[data-slot="select-trigger"]');
		expect(trigger?.getAttribute('aria-required')).toBe('true');
	});
});
