/**
 * @coral/kit/shortcut
 * @version 1.0.0
 */

import { render } from 'vitest-browser-svelte';
import { userEvent } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import Shortcut from './shortcut.svelte';

const keycaps = () =>
	Array.from(document.querySelectorAll('kbd[data-slot="kbd"]')).map(
		(entry) => entry.querySelector('[aria-hidden="true"]')?.textContent
	);
const spoken = () =>
	Array.from(document.querySelectorAll('kbd[data-slot="kbd"]')).map(
		(entry) => entry.querySelector('.sr-only')?.textContent
	);

describe('drawing', () => {
	it('draws `mod` as Command on a Mac, with the symbols Apple prints', async () => {
		await render(Shortcut, { keys: 'mod+shift+k', platform: 'mac' });
		expect(keycaps()).toEqual(['⇧', '⌘', 'K']);
		expect(spoken()).toEqual(['Shift', 'Command', 'K']);
	});

	it('draws `mod` as Control elsewhere', async () => {
		await render(Shortcut, { keys: 'mod+shift+k', platform: 'other' });
		expect(keycaps()).toEqual(['Ctrl', 'Shift', 'K']);
	});

	it('speaks a key by its name, never by its glyph', async () => {
		await render(Shortcut, { keys: 'mod+enter', platform: 'mac' });
		expect(spoken()).toEqual(['Command', 'Enter']);
	});

	it('understands the spellings people reach for', async () => {
		await render(Shortcut, { keys: 'cmd+opt+esc', platform: 'mac' });
		expect(spoken()).toEqual(['Option', 'Command', 'Escape']);
	});

	it('takes the drawing of a key from a snippet', async () => {
		const { createRawSnippet } = await import('svelte');
		const key = createRawSnippet<[{ symbol: string }]>((token) => ({
			render: () => `<i data-key>${token().symbol}</i>`
		}));
		await render(Shortcut, { keys: 'ctrl+k', platform: 'other', key });
		expect(
			Array.from(document.querySelectorAll('[data-key]')).map((entry) => entry.textContent)
		).toEqual(['Ctrl', 'K']);
	});
});

describe('binding', () => {
	it('draws only, until it is given something to call', async () => {
		await render(Shortcut, { keys: 'ctrl+k', platform: 'other' });
		const press = new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, cancelable: true });
		window.dispatchEvent(press);
		expect(press.defaultPrevented).toBe(false);
	});

	it('calls the handler on the combo, and stops the browser acting on it', async () => {
		const onpress = vi.fn();
		await render(Shortcut, { keys: 'ctrl+k', platform: 'other', onpress });

		const press = new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, cancelable: true });
		window.dispatchEvent(press);
		expect(onpress).toHaveBeenCalledTimes(1);
		expect(press.defaultPrevented).toBe(true);
	});

	it('leaves the browser alone when told to', async () => {
		const onpress = vi.fn();
		await render(Shortcut, { keys: 'ctrl+k', platform: 'other', onpress, preventDefault: false });

		const press = new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, cancelable: true });
		window.dispatchEvent(press);
		expect(onpress).toHaveBeenCalledTimes(1);
		expect(press.defaultPrevented).toBe(false);
	});

	it('matches the modifiers exactly, so `ctrl+k` is not `ctrl+shift+k`', async () => {
		const onpress = vi.fn();
		await render(Shortcut, { keys: 'ctrl+k', platform: 'other', onpress });

		window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, shiftKey: true }));
		expect(onpress).not.toHaveBeenCalled();
	});

	it('stops listening while not enabled, and starts again when it is', async () => {
		const onpress = vi.fn();
		const props = $state({ keys: 'ctrl+k', platform: 'other' as const, onpress, enabled: false });
		await render(Shortcut, props);

		window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }));
		expect(onpress).not.toHaveBeenCalled();

		props.enabled = true;
		await expect
			.poll(() => {
				window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }));
				return onpress.mock.calls.length;
			})
			.toBeGreaterThan(0);
	});

	it('stops listening when it goes away', async () => {
		const onpress = vi.fn();
		const view = await render(Shortcut, { keys: 'ctrl+k', platform: 'other', onpress });

		view.unmount();
		window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }));
		expect(onpress).not.toHaveBeenCalled();
	});

	it('does not fire a plain key from inside a field, and does from outside one', async () => {
		const onpress = vi.fn();
		document.body.insertAdjacentHTML('beforeend', '<input id="shortcut-field" />');
		try {
			await render(Shortcut, { keys: '/', platform: 'other', onpress });

			document.getElementById('shortcut-field')!.focus();
			await userEvent.keyboard('/');
			expect(onpress).not.toHaveBeenCalled();

			(document.activeElement as HTMLElement).blur();
			await userEvent.keyboard('/');
			expect(onpress).toHaveBeenCalledTimes(1);
		} finally {
			document.getElementById('shortcut-field')?.remove();
		}
	});

	it('fires a combo with a modifier from inside a field', async () => {
		const onpress = vi.fn();
		document.body.insertAdjacentHTML('beforeend', '<input id="shortcut-field" />');
		try {
			await render(Shortcut, { keys: 'ctrl+k', platform: 'other', onpress });

			document.getElementById('shortcut-field')!.focus();
			await userEvent.keyboard('{Control>}k{/Control}');
			expect(onpress).toHaveBeenCalledTimes(1);
		} finally {
			document.getElementById('shortcut-field')?.remove();
		}
	});

	it('fires once for a held key, not once per repeat', async () => {
		const onpress = vi.fn();
		await render(Shortcut, { keys: 'ctrl+k', platform: 'other', onpress });

		window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true }));
		window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, repeat: true }));
		expect(onpress).toHaveBeenCalledTimes(1);
	});
});
