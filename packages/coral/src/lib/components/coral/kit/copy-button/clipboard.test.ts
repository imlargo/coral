/**
 * @coral/kit/copy-button
 * @version 1.0.0
 */

import { afterEach, describe, expect, it, vi } from 'vitest';
import { resolveText, writeText } from './clipboard.js';

afterEach(() => {
	vi.unstubAllGlobals();
});

describe('resolveText', () => {
	it('passes a string through', async () => {
		expect(await resolveText('hola')).toBe('hola');
	});

	it('calls a function, sync or async', async () => {
		expect(await resolveText(() => 'sync')).toBe('sync');
		expect(await resolveText(async () => 'async')).toBe('async');
	});
});

describe('writeText', () => {
	it('uses the async clipboard API when there is one', async () => {
		const write = vi.fn().mockResolvedValue(undefined);
		vi.stubGlobal('navigator', { clipboard: { writeText: write } });

		await writeText('copied');
		expect(write).toHaveBeenCalledWith('copied');
	});

	it('rejects when there is no clipboard API and no document to fall back on', async () => {
		vi.stubGlobal('navigator', {});
		await expect(writeText('nowhere')).rejects.toThrow();
	});

	it('rejects a denied permission when there is nothing to fall back on', async () => {
		const denied = new DOMException('denied', 'NotAllowedError');
		vi.stubGlobal('navigator', { clipboard: { writeText: vi.fn().mockRejectedValue(denied) } });

		await expect(writeText('secret')).rejects.toBe(denied);
	});
});
