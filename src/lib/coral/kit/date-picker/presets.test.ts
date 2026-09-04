/**
 * @coral/kit/date-picker
 * @version 1.1.0
 */

import { describe, expect, it } from 'vitest';
import { activePreset, resolvePreset } from './presets.js';
import { isSameDay, isSameRange } from './format.js';
import type { Day, DayRange } from './format.js';
import type { Preset } from './presets.js';

const jan5: Day = { year: 2026, month: 1, day: 5 };
const jan9: Day = { year: 2026, month: 1, day: 9 };

describe('resolvePreset', () => {
	it('hands back a plain value as it is', () => {
		expect(resolvePreset({ label: 'Año nuevo', value: jan5 })).toBe(jan5);
	});

	it('calls a thunk, so a relative preset is computed now and not at import', () => {
		let calls = 0;
		const preset: Preset<Day> = {
			label: 'Hoy',
			value: () => {
				calls += 1;
				return jan9;
			}
		};

		expect(resolvePreset(preset)).toBe(jan9);
		expect(resolvePreset(preset)).toBe(jan9);
		expect(calls).toBe(2);
	});
});

describe('activePreset', () => {
	const presets: Preset<Day>[] = [
		{ label: 'Cinco', value: () => ({ ...jan5 }) },
		{ label: 'Nueve', value: () => ({ ...jan9 }) }
	];

	it('finds the preset the selection came from, though the objects differ', () => {
		expect(activePreset(presets, { ...jan9 }, isSameDay)?.label).toBe('Nueve');
	});

	it('returns nothing when the selection matches no preset', () => {
		expect(activePreset(presets, { year: 2026, month: 3, day: 1 }, isSameDay)).toBeUndefined();
	});

	it('returns nothing when nothing is selected', () => {
		expect(activePreset(presets, undefined, isSameDay)).toBeUndefined();
	});

	it('keeps the first of two presets that resolve alike', () => {
		const twins: Preset<Day>[] = [
			{ label: 'Primero', value: jan5 },
			{ label: 'Segundo', value: { ...jan5 } }
		];
		expect(activePreset(twins, { ...jan5 }, isSameDay)?.label).toBe('Primero');
	});

	it('works on ranges through the equality it is handed', () => {
		const ranges: Preset<DayRange>[] = [
			{ label: 'Enero', value: () => ({ start: { ...jan5 }, end: { ...jan9 } }) }
		];
		expect(activePreset(ranges, { start: jan5, end: jan9 }, isSameRange)?.label).toBe('Enero');
	});
});
