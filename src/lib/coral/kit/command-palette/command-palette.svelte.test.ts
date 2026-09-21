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
		{ id: 'new', label: 'Nuevo proyecto', group: 'Crear', shortcut: 'mod+shift+n', run },
		{ id: 'import', label: 'Importar', group: 'Crear', keywords: ['csv'], run },
		{ id: 'settings', label: 'Preferencias', group: 'Cuenta', run }
	];
}

describe('opening', () => {
	it('closes on its own combo even where the primitive reads it as vim navigation', async () => {
		// Ctrl+K is "previous item" to the command primitive, which preventDefaults it.
		await render(CommandPalette, { actions: actions(), open: true });
		await userEvent.keyboard('{Control>}k{/Control}');
		await expect.poll(dialog).toBeNull();
	});

	it('opens on its shortcut and closes on it again', async () => {
		await render(CommandPalette, { actions: actions() });
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
			actions: [{ id: 'save', label: 'Guardar', run: () => false }],
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

		// "Cuenta" held nothing but the lifted action, so it is gone rather than left empty.
		await expect.poll(headings).toEqual(['Recent', 'Crear']);
		expect(rows().filter((row) => row === 'Preferencias').length).toBe(1);
	});

	it('finds an action by a keyword that is never shown', async () => {
		await render(CommandPalette, { actions: actions(), open: true });

		await userEvent.keyboard('csv');
		await expect.poll(rows).toEqual(['Importar']);
	});
});
