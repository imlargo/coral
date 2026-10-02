/**
 * @coral/lib/debounce
 * @version 1.0.0
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { debounce } from './debounce.js';

beforeEach(() => {
	vi.useFakeTimers();
});

afterEach(() => {
	vi.useRealTimers();
});

describe('debounce', () => {
	it('calls once, with the last arguments, after the calls stop', () => {
		const fn = vi.fn();
		const search = debounce(fn, 200);

		search('b');
		search('bo');
		search('bog');
		expect(fn).not.toHaveBeenCalled();

		vi.advanceTimersByTime(200);
		expect(fn).toHaveBeenCalledTimes(1);
		expect(fn).toHaveBeenCalledWith('bog');
	});

	it('restarts the wait on every call', () => {
		const fn = vi.fn();
		const search = debounce(fn, 200);

		search('a');
		vi.advanceTimersByTime(150);
		search('ab');
		vi.advanceTimersByTime(150);
		expect(fn).not.toHaveBeenCalled();

		vi.advanceTimersByTime(50);
		expect(fn).toHaveBeenCalledWith('ab');
	});

	it('calls straight through, synchronously, when the wait is zero', () => {
		const fn = vi.fn();
		debounce(fn, 0)('now');
		expect(fn).toHaveBeenCalledWith('now');
	});

	it('reads a wait function on every call, so a changed prop takes effect', () => {
		const fn = vi.fn();
		let wait = 0;
		const search = debounce(fn, () => wait);

		search('first');
		expect(fn).toHaveBeenCalledTimes(1);

		wait = 100;
		search('second');
		expect(fn).toHaveBeenCalledTimes(1);
		vi.advanceTimersByTime(100);
		expect(fn).toHaveBeenLastCalledWith('second');
	});

	it('drops a pending call on cancel', () => {
		const fn = vi.fn();
		const search = debounce(fn, 100);

		search('gone');
		search.cancel();
		vi.advanceTimersByTime(500);
		expect(fn).not.toHaveBeenCalled();
	});

	it('runs a pending call early on flush, and only once', () => {
		const fn = vi.fn();
		const search = debounce(fn, 100);

		search('now please');
		search.flush();
		expect(fn).toHaveBeenCalledWith('now please');

		vi.advanceTimersByTime(500);
		expect(fn).toHaveBeenCalledTimes(1);
	});

	it('does nothing on flush when nothing is pending', () => {
		const fn = vi.fn();
		debounce(fn, 100).flush();
		expect(fn).not.toHaveBeenCalled();
	});

	it('reports whether a call is pending', () => {
		const search = debounce(() => {}, 100);
		expect(search.pending).toBe(false);
		search();
		expect(search.pending).toBe(true);
		vi.advanceTimersByTime(100);
		expect(search.pending).toBe(false);
	});

	it('forgets a call queued before a zero-wait call went straight through', () => {
		const fn = vi.fn();
		let wait = 100;
		const search = debounce(fn, () => wait);

		search('stale');
		wait = 0;
		search('fresh');
		vi.advanceTimersByTime(500);

		expect(fn.mock.calls).toEqual([['fresh']]);
	});
});
