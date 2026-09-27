/**
 * @coral/kit/page-state
 * @version 1.0.0
 */

import { describe, expect, it } from 'vitest';
import { hiddenFrom, shownFrom, stateOf, waitUntil } from './delay.js';

const window = { delay: 200, minimum: 400 };

describe('the timing window', () => {
	it('draws nothing for the first delay', () => {
		expect(shownFrom(1_000, window)).toBe(1_200);
	});

	it('keeps what it drew for the minimum', () => {
		expect(hiddenFrom(1_200, window)).toBe(1_600);
	});

	it('reads a negative window as no wait at all', () => {
		expect(shownFrom(1_000, { delay: -50, minimum: 0 })).toBe(1_000);
		expect(hiddenFrom(1_000, { delay: 0, minimum: -50 })).toBe(1_000);
	});

	it('never asks a caller to wait a negative time', () => {
		expect(waitUntil(1_200, 1_000)).toBe(200);
		expect(waitUntil(1_200, 5_000)).toBe(0);
	});
});

describe('stateOf', () => {
	const base = { loading: false, error: undefined, empty: false, showLoading: false };

	it('shows the content when there is content', () => {
		expect(stateOf(base)).toBe('content');
	});

	it('shows the empty state when there is nothing', () => {
		expect(stateOf({ ...base, empty: true })).toBe('empty');
	});

	it('shows a wait only once it has earned its indicator', () => {
		expect(stateOf({ ...base, loading: true })).toBe('idle');
		expect(stateOf({ ...base, loading: true, showLoading: true })).toBe('loading');
	});

	it('keeps an indicator that is already drawn, so it cannot blink out', () => {
		// The rows have landed, but the spinner has not been up long enough to be worth seeing.
		expect(stateOf({ ...base, showLoading: true })).toBe('loading');
		expect(stateOf({ ...base, showLoading: true, empty: true })).toBe('loading');
	});

	it('keeps an error visible through a reload, instead of flickering back to a spinner', () => {
		expect(stateOf({ ...base, loading: true, showLoading: true, error: new Error('nope') })).toBe(
			'error'
		);
	});

	it('does not call a failed screen empty', () => {
		expect(stateOf({ ...base, empty: true, error: 'offline' })).toBe('error');
	});

	it('does not call a loading screen empty, which is what blanks a refresh', () => {
		expect(stateOf({ ...base, loading: true, showLoading: true, empty: true })).toBe('loading');
	});
});
