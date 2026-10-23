import { afterEach, describe, expect, it, vi } from 'vitest';
import { logger, setLogger, type Logger } from './logger';

// Snapshot the default so swapping it below doesn't leak into other test files.
const defaultLogger = logger;
afterEach(() => setLogger(defaultLogger));

describe('logger (ConsoleLogger, the default)', () => {
	it('logs under the given scope, with its context', () => {
		const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
		const error = new Error('boom');

		logger.error('server', error, { errorId: '42' });

		expect(spy).toHaveBeenCalledWith('[server]', error, { errorId: '42' });
		spy.mockRestore();
	});

	it('never returns the raw message of the error', () => {
		const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

		const message = logger.error('server', new TypeError('Cannot read properties of undefined'));

		expect(message).toBe('An unexpected error occurred.');
		spy.mockRestore();
	});
});

describe('setLogger', () => {
	it('swaps the implementation every caller uses, without touching the call sites', () => {
		const calls: Array<[string, unknown]> = [];
		const fake: Logger = {
			error(scope, error) {
				calls.push([scope, error]);
				return 'handled';
			}
		};

		setLogger(fake);
		const message = logger.error('server', 'db down');

		expect(calls).toEqual([['server', 'db down']]);
		expect(message).toBe('handled');
	});
});
