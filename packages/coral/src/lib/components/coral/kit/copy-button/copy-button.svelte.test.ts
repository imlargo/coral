/**
 * @coral/kit/copy-button
 * @version 1.0.0
 */

import { render } from 'vitest-browser-svelte';
import { createRawSnippet } from 'svelte';
import { userEvent } from 'vitest/browser';
import { afterEach, describe, expect, it, vi } from 'vitest';
import CopyButton from './copy-button.svelte';
import type { CopyStatus } from './types.js';

const button = () => document.querySelector<HTMLButtonElement>('button')!;
const announced = () => document.querySelector('[role="status"]')?.textContent?.trim();

afterEach(() => vi.restoreAllMocks());

/** Stands in for the async Clipboard API, which a headless page may refuse for want of permission. */
function clipboard(outcome: 'works' | Error = 'works') {
	return vi.spyOn(navigator.clipboard, 'writeText').mockImplementation(async () => {
		if (outcome !== 'works') throw outcome;
	});
}

describe('copying', () => {
	it('puts the text on the clipboard and says so', async () => {
		const write = clipboard();
		const oncopy = vi.fn();
		const props = $state({ text: 'pnpm add coral', oncopy, status: 'idle' as CopyStatus });
		await render(CopyButton, props);

		await userEvent.click(button());
		await expect.poll(() => props.status).toBe('copied');
		expect(write).toHaveBeenCalledWith('pnpm add coral');
		expect(oncopy).toHaveBeenCalledWith('pnpm add coral');
		await expect.poll(announced).toBe('Copied');
	});

	it('goes back to idle after the timeout, and stops announcing', async () => {
		clipboard();
		// Long enough to be seen by a poll that looks every so often, short enough to wait out.
		const props = $state({ text: 'x', timeout: 400, status: 'idle' as CopyStatus });
		await render(CopyButton, props);

		await userEvent.click(button());
		await expect.poll(() => props.status).toBe('copied');
		await expect.poll(() => props.status).toBe('idle');
		expect(announced()).toBe('');
	});

	it('reads a text function when it is clicked, not when it is drawn', async () => {
		clipboard();
		const text = vi.fn(async () => 'signed-url');
		const oncopy = vi.fn();
		await render(CopyButton, { text, oncopy });
		expect(text).not.toHaveBeenCalled();

		await userEvent.click(button());
		await expect.poll(() => oncopy.mock.calls.length).toBe(1);
		expect(oncopy).toHaveBeenCalledWith('signed-url');
	});

	it('shows that it is working while a slow source resolves', async () => {
		clipboard();
		let release!: (value: string) => void;
		const props = $state({
			text: () => new Promise<string>((resolve) => (release = resolve)),
			status: 'idle' as CopyStatus
		});
		await render(CopyButton, props);

		await userEvent.click(button());
		await expect.poll(() => props.status).toBe('copying');
		expect(button().getAttribute('aria-busy')).toBe('true');
		release('done');
		await expect.poll(() => props.status).toBe('copied');
	});

	it('lets the caller take the click for itself', async () => {
		const write = clipboard();
		const props = $state({
			text: 'x',
			onclick: (event: MouseEvent) => event.preventDefault(),
			status: 'idle' as CopyStatus
		});
		await render(CopyButton, props);

		await userEvent.click(button());
		await new Promise((resolve) => setTimeout(resolve, 30));
		expect(write).not.toHaveBeenCalled();
		expect(props.status).toBe('idle');
	});
});

describe('when it cannot', () => {
	it('falls back on the selection route where the async API is refused for another reason', async () => {
		clipboard(new Error('Document is not focused'));
		const exec = vi.spyOn(document, 'execCommand').mockReturnValue(true);
		const props = $state({ text: 'fallback', status: 'idle' as CopyStatus });
		await render(CopyButton, props);

		await userEvent.click(button());
		await expect.poll(() => props.status).toBe('copied');
		expect(exec).toHaveBeenCalledWith('copy');
	});

	it('reports a failure as a failure, with the reason', async () => {
		const denied = new DOMException('denied', 'NotAllowedError');
		clipboard(denied);
		vi.spyOn(document, 'execCommand').mockReturnValue(false);
		const onerror = vi.fn();
		const props = $state({ text: 'x', onerror, status: 'idle' as CopyStatus });
		await render(CopyButton, props);

		await userEvent.click(button());
		await expect.poll(() => props.status).toBe('failed');
		expect(onerror).toHaveBeenCalledTimes(1);
		await expect.poll(announced).toBe('Copy failed');
	});

	it('reports a text function that throws', async () => {
		clipboard();
		const failure = new Error('no url yet');
		const onerror = vi.fn();
		await render(CopyButton, {
			text: () => {
				throw failure;
			},
			onerror
		});

		await userEvent.click(button());
		await expect.poll(() => onerror.mock.calls.length).toBe(1);
		expect(onerror).toHaveBeenCalledWith(failure);
	});
});

describe('the button', () => {
	it('is named by its label while it is only an icon', async () => {
		await render(CopyButton, { text: 'x', label: 'Copy command' });
		expect(button().getAttribute('aria-label')).toBe('Copy command');
	});

	it('takes its name from visible words instead, when it has them', async () => {
		const children = createRawSnippet(() => ({ render: () => '<span>Copy link</span>' }));
		await render(CopyButton, { text: 'x', label: 'Copy command', children });
		expect(button().hasAttribute('aria-label')).toBe(false);
		expect(button().textContent).toContain('Copy link');
	});

	it('takes the announcements as props', async () => {
		clipboard();
		const props = $state({ text: 'x', copiedLabel: 'Kopiert', status: 'idle' as CopyStatus });
		await render(CopyButton, props);

		await userEvent.click(button());
		await expect.poll(announced).toBe('Kopiert');
	});
});
