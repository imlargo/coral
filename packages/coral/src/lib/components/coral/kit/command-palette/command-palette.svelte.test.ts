/**
 * @coral/kit/command-palette
 * @version 1.0.0
 */

import { render } from 'vitest-browser-svelte';
import { userEvent } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import CommandPalette from './command-palette.svelte';
import type { CommandAction } from './actions.js';

const dialog = () => document.querySelector('[data-slot="dialog-content"]');
const rows = () =>
	Array.from(document.querySelectorAll('[data-slot="command-item"]')).map((row) =>
		row.textContent?.trim()
	);
const headings = () =>
	Array.from(document.querySelectorAll('[data-slot="command-group"]')).map((entry) =>
		entry.getAttribute('data-value')
	);

function actions(run = vi.fn()): CommandAction[] {
	return [
		{ id: 'new', label: 'New project', group: 'Create', shortcut: 'ctrl+shift+n', run },
		{ id: 'import', label: 'Import from CSV', group: 'Create', keywords: ['spreadsheet'], run },
		{ id: 'settings', label: 'Settings', group: 'Account', run }
	];
}

describe('opening', () => {
	it('closes on its own combo even where the primitive reads it as vim navigation', async () => {
		// Ctrl+K is "previous item" to the command primitive, which preventDefaults it.
		// Spelled `ctrl` rather than `mod`, which would be Cmd on a Mac and test nothing here.
		await render(CommandPalette, { actions: actions(), open: true, shortcut: 'ctrl+k' });
		await userEvent.keyboard('{Control>}k{/Control}');
		await expect.poll(dialog).toBeNull();
	});

	it('opens on its shortcut and closes on it again', async () => {
		await render(CommandPalette, { actions: actions(), shortcut: 'ctrl+k' });
		expect(dialog()).toBeNull();

		await userEvent.keyboard('{Control>}k{/Control}');
		await expect.poll(dialog).not.toBeNull();

		await userEvent.keyboard('{Control>}k{/Control}');
		await expect.poll(dialog).toBeNull();
	});

	it('binds nothing when the shortcut is empty', async () => {
		await render(CommandPalette, { actions: actions(), shortcut: '' });
		await userEvent.keyboard('{Control>}k{/Control}');
		expect(dialog()).toBeNull();
	});
});

describe('running', () => {
	it('runs an action, remembers it, and closes', async () => {
		const run = vi.fn();
		const onrun = vi.fn();
		const props = $state({ actions: actions(run), open: true, recent: [] as string[], onrun });
		await render(CommandPalette, props);

		await userEvent.click(document.querySelectorAll('[data-slot="command-item"]')[1]);

		expect(run).toHaveBeenCalledOnce();
		expect(onrun).toHaveBeenCalledWith(expect.objectContaining({ id: 'import' }));
		await expect.poll(dialog).toBeNull();
		expect(props.recent).toEqual(['import']);
	});

	it('stays open when the action refuses', async () => {
		await render(CommandPalette, {
			actions: [{ id: 'save', label: 'Save', run: () => false }],
			open: true
		});

		await userEvent.click(document.querySelector('[data-slot="command-item"]')!);
		expect(dialog()).not.toBeNull();
	});

	it('runs an action from its own shortcut, without opening the palette', async () => {
		const run = vi.fn();
		await render(CommandPalette, { actions: actions(run) });

		await userEvent.keyboard('{Control>}{Shift>}n{/Shift}{/Control}');
		expect(run).toHaveBeenCalledOnce();
		expect(dialog()).toBeNull();
	});
});

describe('listing', () => {
	it('lifts recents into their own group without repeating them', async () => {
		await render(CommandPalette, { actions: actions(), open: true, recent: ['settings'] });

		// "Account" held nothing but the lifted action, so it is gone rather than left empty.
		await expect.poll(headings).toEqual(['Recent', 'Create']);
		expect(rows().filter((row) => row === 'Settings').length).toBe(1);
	});

	it('finds an action by a keyword that is never shown', async () => {
		await render(CommandPalette, { actions: actions(), open: true });

		await userEvent.keyboard('spreadsheet');
		await expect.poll(rows).toEqual(['Import from CSV']);
	});
});
