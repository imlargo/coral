/**
 * @coral/kit/file-input
 * @version 1.0.0
 */

import { describe, expect, it } from 'vitest';
import { collect } from './collect.js';

/** `size` is not settable on a File, so the bytes are what make one big. */
const file = (name: string, bytes = 1, type = 'text/plain'): File =>
	new File(['x'.repeat(bytes)], name, { type, lastModified: 1 });

const names = (files: File[]) => files.map((entry) => entry.name);

describe('collect', () => {
	it('appends when several files are allowed', () => {
		const { files } = collect([file('b.txt')], { current: [file('a.txt')], limit: 5 });
		expect(names(files)).toEqual(['a.txt', 'b.txt']);
	});

	it('replaces when only one file is allowed', () => {
		const { files } = collect([file('b.txt')], { current: [file('a.txt')], limit: 1 });
		expect(names(files)).toEqual(['b.txt']);
	});

	it('rejects a file the accept turns away, and keeps what was already held', () => {
		const current = [file('a.txt')];
		const { files, rejected } = collect([file('b.png', 1, 'image/png')], {
			current,
			accept: 'text/plain',
			limit: 1
		});
		expect(rejected).toEqual([{ file: expect.any(File), reason: 'type' }]);
		// By identity: a rejected pick must not clear a single-file field.
		expect(files).toBe(current);
	});

	it('rejects a file over maxSize', () => {
		const { files, rejected } = collect([file('big.txt', 100)], {
			current: [],
			maxSize: 10,
			limit: 5
		});
		expect(rejected[0].reason).toBe('size');
		expect(files).toEqual([]);
	});

	it('treats maxSize as inclusive', () => {
		const { rejected } = collect([file('exact.txt', 10)], { current: [], maxSize: 10, limit: 5 });
		expect(rejected).toEqual([]);
	});

	it('rejects the overflow once the limit is reached, keeping the ones that fit', () => {
		const { files, rejected } = collect([file('b.txt'), file('c.txt'), file('d.txt')], {
			current: [file('a.txt')],
			limit: 3
		});
		expect(names(files)).toEqual(['a.txt', 'b.txt', 'c.txt']);
		expect(rejected).toHaveLength(1);
		expect(rejected[0].reason).toBe('count');
	});

	it('skips a file it already holds without calling it a rejection', () => {
		const current = [file('a.txt')];
		const { files, rejected } = collect([file('a.txt')], { current, limit: 5 });
		expect(rejected).toEqual([]);
		expect(files).toBe(current);
	});

	it('skips a duplicate inside a single batch', () => {
		const { files } = collect([file('a.txt'), file('a.txt')], { current: [], limit: 5 });
		expect(names(files)).toEqual(['a.txt']);
	});

	it('returns the current list by identity when nothing gets through', () => {
		const current = [file('a.txt')];
		const { files } = collect([], { current, limit: 5 });
		expect(files).toBe(current);
	});

	it('reports every rejection, not just the first', () => {
		const { rejected } = collect([file('big.txt', 100), file('other.txt', 100)], {
			current: [],
			maxSize: 10,
			limit: 5
		});
		expect(rejected).toHaveLength(2);
	});
});
