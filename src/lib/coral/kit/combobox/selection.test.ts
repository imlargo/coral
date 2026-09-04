/**
 * @coral/kit/combobox
 * @version 4.1.0
 */

import { describe, expect, it } from 'vitest';
import { selectAllVisible } from './selection.js';
import type { Option } from '../../lib/options.js';

const all: Option<string>[] = [
	{ value: 'bog', label: 'Bogotá' },
	{ value: 'med', label: 'Medellín' },
	{ value: 'cal', label: 'Cali' },
	{ value: 'brr', label: 'Barranquilla', disabled: true }
];

describe('selectAllVisible', () => {
	it('takes everything selectable when nothing is filtered out', () => {
		expect(selectAllVisible(all, all, [])).toEqual(['bog', 'med', 'cal']);
	});

	it('leaves out what cannot be picked one at a time either', () => {
		expect(selectAllVisible(all, all, [])).not.toContain('brr');
	});

	it('keeps a selection the filter is hiding', () => {
		// The whole point: 'bog' is selected and off-screen, so replacing would silently drop it.
		const visible = [all[1]];
		expect(selectAllVisible(all, visible, ['bog'])).toEqual(['bog', 'med']);
	});

	it('adds nothing twice when the selection and the filter overlap', () => {
		expect(selectAllVisible(all, [all[0], all[1]], ['bog'])).toEqual(['bog', 'med']);
	});

	it('reports in list order, not in the order values were added', () => {
		expect(selectAllVisible(all, [all[0]], ['cal'])).toEqual(['bog', 'cal']);
	});

	it('is a no-op on a selection when the filter matches nothing', () => {
		expect(selectAllVisible(all, [], ['med'])).toEqual(['med']);
	});

	it('has nothing to select when the list is empty', () => {
		expect(selectAllVisible([], [], [])).toEqual([]);
	});

	it('keeps a disabled option that was already selected', () => {
		// It was selected somehow - programmatically, or before it was disabled. Dropping it here
		// would be a bulk action quietly deselecting something.
		expect(selectAllVisible(all, all, ['brr'])).toEqual(['bog', 'med', 'cal', 'brr']);
	});
});
