/**
 * @coral/lib/options
 * @version 1.0.0
 */

import { describe, expect, it } from 'vitest';
import { flatten, isGroup, toGroups } from './options.js';
import type { Option } from './options.js';

const option = (over: Partial<Option<string>> = {}): Option<string> => ({
	value: 'bogota',
	label: 'Bogotá',
	...over
});

describe('isGroup', () => {
	it('recognises a group by its options array', () => {
		expect(isGroup({ label: 'Andina', options: [] })).toBe(true);
	});

	it('treats a plain option as an option', () => {
		expect(isGroup(option())).toBe(false);
	});
});

describe('toGroups', () => {
	it('wraps a flat list in one unlabelled group', () => {
		const groups = toGroups([option()]);
		expect(groups).toHaveLength(1);
		expect(groups[0].label).toBeUndefined();
		expect(groups[0].options).toHaveLength(1);
	});

	it('passes a grouped list through untouched', () => {
		const input = [{ label: 'Andina', options: [option()] }];
		expect(toGroups(input)).toBe(input);
	});

	it('handles an empty list', () => {
		expect(toGroups([])).toEqual([]);
	});
});

describe('flatten', () => {
	it('discards grouping and keeps order', () => {
		const result = flatten([
			{ label: 'A', options: [option({ value: '1' }), option({ value: '2' })] },
			{ label: 'B', options: [option({ value: '3' })] }
		]);
		expect(result.map((o) => o.value)).toEqual(['1', '2', '3']);
	});

	it('is a no-op shape change for a flat list', () => {
		expect(flatten([option()])).toHaveLength(1);
	});

	it('indexes in the same order a component walks the groups', () => {
		const groups = [
			{ label: 'A', options: [option({ value: '1' })] },
			{ label: 'B', options: [option({ value: '2' }), option({ value: '3' })] }
		];
		const walked = toGroups(groups).flatMap((group) => group.options);
		expect(flatten(groups)).toEqual(walked);
	});
});
