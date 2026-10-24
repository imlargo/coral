/**
 * @coral/kit/combobox
 * @version 1.1.0
 */

import { describe, expect, it } from 'vitest';
import { Remembered } from './remembered.js';
import type { Option } from '../../lib/options.js';

const fruits: Option<number>[] = [
	{ value: 1, label: 'Açaí' },
	{ value: 2, label: 'Guava' },
	{ value: 3, label: 'Kiwi' }
];

describe('Remembered', () => {
	it('hydrates from the list, in list order', () => {
		const memory = new Remembered<number>();
		expect(memory.hydrate(fruits, [3, 1]).map((option) => option.label)).toEqual(['Açaí', 'Kiwi']);
	});

	it('keeps an option the list stopped including', () => {
		const memory = new Remembered<number>();
		memory.hydrate(fruits, [2]);
		expect(memory.hydrate([fruits[2]], [2]).map((option) => option.label)).toEqual(['Guava']);
	});

	it('lists what is there first, then what it remembers, in selection order', () => {
		const memory = new Remembered<number>();
		memory.hydrate(fruits, [1, 2]);
		const labels = memory.hydrate([fruits[2]], [2, 3, 1]).map((option) => option.label);
		expect(labels).toEqual(['Kiwi', 'Guava', 'Açaí']);
	});

	it('prefers the list over its memory when both have the option', () => {
		const memory = new Remembered<number>();
		memory.hydrate(fruits, [2]);
		const renamed = [{ value: 2, label: 'Guayaba' }];
		expect(memory.hydrate(renamed, [2])[0].label).toBe('Guayaba');
	});

	it('drops a value it has never seen', () => {
		const memory = new Remembered<number>();
		expect(memory.hydrate(fruits, [9])).toEqual([]);
	});
});
