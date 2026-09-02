/**
 * @coral/kit/tags-input
 * @version 1.0.0
 */

import { describe, expect, it } from 'vitest';
import { add, split } from './tags.js';

describe('split', () => {
	it('cuts on the default comma', () => {
		expect(split('a,b,c')).toEqual(['a', 'b', 'c']);
	});

	it('keeps the fragment after the last delimiter, empty or not', () => {
		expect(split('a,')).toEqual(['a', '']);
		expect(split('a,b')).toEqual(['a', 'b']);
	});

	it('returns a single piece when no delimiter is present', () => {
		expect(split('still typing')).toEqual(['still typing']);
	});

	it('cuts on newlines whatever the delimiter is', () => {
		expect(split('a\nb\r\nc', ';')).toEqual(['a', 'b', 'c']);
	});

	it('takes a custom string delimiter', () => {
		expect(split('a | b | c', '|')).toEqual(['a ', ' b ', ' c']);
	});

	it('takes a regular expression', () => {
		expect(split('a, b;c', /[,;]/)).toEqual(['a', ' b', 'c']);
	});

	it('reads an empty delimiter as no delimiter, not as one cut per character', () => {
		expect(split('abc', '')).toEqual(['abc']);
	});
});

describe('add', () => {
	it('appends to what is already held', () => {
		const { tags } = add(['b'], { current: ['a'] });
		expect(tags).toEqual(['a', 'b']);
	});

	it('trims by default', () => {
		const { tags } = add(['  spaced  '], { current: [] });
		expect(tags).toEqual(['spaced']);
	});

	it('drops empty values without reporting them', () => {
		const current: string[] = [];
		const { tags, rejected } = add(['', '   '], { current });
		expect(rejected).toEqual([]);
		expect(tags).toBe(current);
	});

	it('takes a custom sanitize', () => {
		const { tags } = add([' Vanilla '], {
			current: [],
			sanitize: (raw) => raw.trim().toLowerCase()
		});
		expect(tags).toEqual(['vanilla']);
	});

	it('rejects a duplicate and keeps what was already held', () => {
		const current = ['a'];
		const { tags, rejected } = add(['a'], { current });
		expect(rejected).toEqual([{ value: 'a', reason: 'duplicate' }]);
		// By identity: a rejected entry must not rebuild the list.
		expect(tags).toBe(current);
	});

	it('dedupes within a single batch', () => {
		const { tags, rejected } = add(['a', 'a'], { current: [] });
		expect(tags).toEqual(['a']);
		expect(rejected).toEqual([{ value: 'a', reason: 'duplicate' }]);
	});

	it('allows duplicates when told to', () => {
		const { tags, rejected } = add(['a'], { current: ['a'], allowDuplicates: true });
		expect(tags).toEqual(['a', 'a']);
		expect(rejected).toEqual([]);
	});

	it('stops at max and reports the overflow', () => {
		const { tags, rejected } = add(['b', 'c'], { current: ['a'], max: 2 });
		expect(tags).toEqual(['a', 'b']);
		expect(rejected).toEqual([{ value: 'c', reason: 'max' }]);
	});

	it('reports a duplicate as a duplicate even when the list is full', () => {
		const { rejected } = add(['a'], { current: ['a'], max: 1 });
		expect(rejected).toEqual([{ value: 'a', reason: 'duplicate' }]);
	});

	it('rejects what validate turns away', () => {
		const { tags, rejected } = add(['ok', 'no'], {
			current: [],
			validate: (value) => value !== 'no'
		});
		expect(tags).toEqual(['ok']);
		expect(rejected).toEqual([{ value: 'no', reason: 'invalid' }]);
	});

	it('hands validate the list as it grows, not the list it started with', () => {
		const seen: string[][] = [];
		add(['a', 'b'], {
			current: [],
			validate: (_, tags) => {
				seen.push([...tags]);
				return true;
			}
		});
		expect(seen).toEqual([[], ['a']]);
	});

	it('never mutates the list it was given', () => {
		const current = ['a'];
		add(['b'], { current });
		expect(current).toEqual(['a']);
	});
});
