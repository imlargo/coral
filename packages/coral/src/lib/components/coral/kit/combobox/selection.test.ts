/**
 * @coral/kit/combobox
 * @version 4.2.0
 */

import { describe, expect, it } from 'vitest';
import { selectAllVisible } from './selection.js';
import type { Option } from '../../lib/options.js';

const all: Option<string>[] = [
	{ value: 'aca', label: 'Açaí' },
	{ value: 'gua', label: 'Guava' },
	{ value: 'kiw', label: 'Kiwi' },
	{ value: 'lyc', label: 'Lychee', disabled: true }
];

describe('selectAllVisible', () => {
	it('takes everything selectable when nothing is filtered out', () => {
		expect(selectAllVisible(all, all, [])).toEqual(['aca', 'gua', 'kiw']);
	});

	it('leaves out what cannot be picked one at a time either', () => {
		expect(selectAllVisible(all, all, [])).not.toContain('lyc');
	});

	it('keeps a selection the filter is hiding', () => {
		// The whole point: 'aca' is selected and off-screen, so replacing would silently drop it.
		const visible = [all[1]];
		expect(selectAllVisible(all, visible, ['aca'])).toEqual(['aca', 'gua']);
	});

	it('adds nothing twice when the selection and the filter overlap', () => {
		expect(selectAllVisible(all, [all[0], all[1]], ['aca'])).toEqual(['aca', 'gua']);
	});

	it('reports in list order, not in the order values were added', () => {
		expect(selectAllVisible(all, [all[0]], ['kiw'])).toEqual(['aca', 'kiw']);
	});

	it('is a no-op on a selection when the filter matches nothing', () => {
		expect(selectAllVisible(all, [], ['gua'])).toEqual(['gua']);
	});

	it('has nothing to select when the list is empty', () => {
		expect(selectAllVisible([], [], [])).toEqual([]);
	});

	it('keeps a disabled option that was already selected', () => {
		// It was selected somehow - programmatically, or before it was disabled. Dropping it here
		// would be a bulk action quietly deselecting something.
		expect(selectAllVisible(all, all, ['lyc'])).toEqual(['aca', 'gua', 'kiw', 'lyc']);
	});
});
