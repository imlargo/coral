/**
 * @coral/lib/action
 * @version 1.0.0
 */

import { describe, expect, it } from 'vitest';
import { Action } from './action.svelte.js';

/** A promise the test settles by hand, so the in-flight state can be observed. */
function deferred<T = void>() {
	let resolve!: (value: T) => void;
	let reject!: (reason: unknown) => void;
	const promise = new Promise<T>((res, rej) => {
		resolve = res;
		reject = rej;
	});
	return { promise, resolve, reject };
}

describe('Action', () => {
	it('counts a handler that returns nothing as done', async () => {
		const action = new Action();
		expect(await action.run(() => {})).toBe(true);
	});

	it('counts exactly `false` as not done', async () => {
		const action = new Action();
		expect(await action.run(() => false)).toBe(false);
		expect(await action.run(async () => false)).toBe(false);
	});

	it('does not read other falsy values as failure', async () => {
		const action = new Action();
		expect(await action.run(() => 0)).toBe(true);
		expect(await action.run(() => null)).toBe(true);
		expect(await action.run(() => '')).toBe(true);
	});

	it('is running while the promise is pending, and not after', async () => {
		const action = new Action();
		const request = deferred();

		const done = action.run(() => request.promise);
		expect(action.running).toBe(true);

		request.resolve();
		await done;
		expect(action.running).toBe(false);
	});

	it('refuses a second run while the first is in flight', async () => {
		const action = new Action();
		const request = deferred();
		let calls = 0;

		const first = action.run(() => {
			calls++;
			return request.promise;
		});
		const second = await action.run(() => {
			calls++;
		});

		expect(second).toBe(false);
		expect(calls).toBe(1);

		request.resolve();
		expect(await first).toBe(true);
	});

	it('rethrows, and is free to run again afterwards', async () => {
		const action = new Action();
		const failure = new Error('in use');

		await expect(
			action.run(() => {
				throw failure;
			})
		).rejects.toBe(failure);

		expect(action.running).toBe(false);
		expect(await action.run(() => {})).toBe(true);
	});
});
