/**
 * @coral/kit/tree-view
 * @version 1.1.0
 */

import { render } from 'vitest-browser-svelte';
import { createRawSnippet } from 'svelte';
import { userEvent } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import TreeView from './tree-view.svelte';
import type { TreeNode } from './tree.js';
import type { NodeContext } from './types.js';

const nodes: TreeNode[] = [
	{
		id: 'src',
		label: 'src',
		children: [
			{ id: 'lib', label: 'lib', children: [{ id: 'utils', label: 'utils.ts' }] },
			{ id: 'app', label: 'app.html', disabled: true }
		]
	},
	{ id: 'readme', label: 'README.md' }
];

const row = (id: string) =>
	document.getElementById(document.querySelector(`[role="treeitem"][id$="-${id}"]`)?.id ?? '');
const focusedId = () => document.activeElement?.id.split('-').pop();

describe('focus', () => {
	it('puts exactly one row in the tab order', async () => {
		await render(TreeView, { nodes, label: 'Files' });
		const tabbable = document.querySelectorAll('[role="treeitem"][tabindex="0"]');
		expect(tabbable.length).toBe(1);
	});

	it('walks the tree with the arrow keys', async () => {
		await render(TreeView, { nodes, label: 'Files' });
		row('src')!.focus();

		await userEvent.keyboard('{ArrowRight}');
		expect(row('src')?.getAttribute('aria-expanded')).toBe('true');

		await userEvent.keyboard('{ArrowRight}');
		await expect.poll(focusedId).toBe('lib');

		await userEvent.keyboard('{ArrowLeft}');
		await expect.poll(focusedId).toBe('src');

		await userEvent.keyboard('{End}');
		await expect.poll(focusedId).toBe('readme');
	});

	it('moves focus to a folder that closes over it', async () => {
		await render(TreeView, { nodes, label: 'Files', expanded: ['src', 'lib'] });
		row('utils')!.focus();

		// Close `src` by clicking its chevron, which hides the focused row.
		const chevron = row('src')!.querySelector<HTMLElement>('[data-coral-toggle]')!;
		await userEvent.click(chevron);
		await expect.poll(focusedId).toBe('src');
	});

	it('jumps by typed letters', async () => {
		await render(TreeView, { nodes, label: 'Files' });
		row('src')!.focus();

		await userEvent.keyboard('r');
		await expect.poll(focusedId).toBe('readme');
	});
});

describe('indentation', () => {
	it('survives padding in rowClass, which used to erase it', async () => {
		await render(TreeView, { nodes, label: 'Files', expanded: ['src'], rowClass: 'px-2' });
		const indent = (id: string) =>
			getComputedStyle(row(id)!.firstElementChild as HTMLElement).width;
		expect(indent('src')).toBe('0px');
		expect(Number.parseFloat(indent('lib'))).toBeGreaterThan(0);
		expect(getComputedStyle(row('lib')!).paddingLeft).toBe('8px');
	});
});

describe('row actions', () => {
	const actions = createRawSnippet<[NodeContext<unknown>]>((context) => ({
		render: () =>
			`<span><button data-action="rename">Rename ${context().node.label}</button><button data-action="delete">Delete</button></span>`
	}));
	const rename = (id: string) =>
		row(id)!.querySelector<HTMLButtonElement>('[data-action="rename"]')!;
	const remove = (id: string) =>
		row(id)!.querySelector<HTMLButtonElement>('[data-action="delete"]')!;

	it('keeps them out of the tab order, so the tree stays one tab stop', async () => {
		await render(TreeView, { nodes, label: 'Files', actions });
		expect(document.querySelectorAll('[role="tree"] [tabindex="0"]')).toHaveLength(1);
		expect(rename('src').tabIndex).toBe(-1);
	});

	it('reaches them with Tab from the row, and comes back with Shift+Tab', async () => {
		await render(TreeView, { nodes, label: 'Files', actions });
		row('src')!.focus();

		await userEvent.keyboard('{Tab}');
		expect(document.activeElement).toBe(rename('src'));
		await userEvent.keyboard('{Tab}');
		expect(document.activeElement).toBe(remove('src'));
		await userEvent.keyboard('{Shift>}{Tab}{/Shift}');
		expect(document.activeElement).toBe(rename('src'));
		await userEvent.keyboard('{Shift>}{Tab}{/Shift}');
		expect(document.activeElement).toBe(row('src'));
	});

	it('leaves the tree past the last action, from the row', async () => {
		await render(TreeView, { nodes, label: 'Files', actions });
		// After the tree in the document, so it is where Tab out of the tree lands.
		document.body.insertAdjacentHTML('beforeend', '<button id="after">After</button>');
		try {
			remove('src').focus();
			await userEvent.keyboard('{Tab}');
			expect(document.activeElement?.id).toBe('after');
		} finally {
			document.getElementById('after')?.remove();
		}
	});

	it('goes back to the row on Escape, and keeps the key', async () => {
		await render(TreeView, { nodes, label: 'Files', actions });
		rename('src').focus();
		await userEvent.keyboard('{Escape}');
		expect(document.activeElement).toBe(row('src'));
	});

	it('does not select the row when an action is clicked', async () => {
		const onselect = vi.fn();
		await render(TreeView, { nodes, label: 'Files', actions, onselect });
		await userEvent.click(rename('readme'));
		expect(onselect).not.toHaveBeenCalled();
		// The arrow keys continue from the row whose action was used.
		await userEvent.keyboard('{Escape}{ArrowUp}');
		await expect.poll(focusedId).toBe('src');
	});
});

describe('selection', () => {
	it('selects with Enter and reports it', async () => {
		const onselect = vi.fn();
		await render(TreeView, { nodes, label: 'Files', onselect });
		row('readme')!.focus();

		await userEvent.keyboard('{Enter}');
		expect(onselect).toHaveBeenCalledWith(expect.objectContaining({ id: 'readme' }));
		expect(row('readme')?.getAttribute('aria-selected')).toBe('true');
	});

	it('never selects a disabled node', async () => {
		const onselect = vi.fn();
		await render(TreeView, { nodes, label: 'Files', expanded: ['src'], onselect });
		row('app')!.focus();

		await userEvent.keyboard('{Enter}');
		expect(onselect).not.toHaveBeenCalled();
	});
});

describe('structure', () => {
	it('carries level, position and set size on every row', async () => {
		await render(TreeView, { nodes, label: 'Files', expanded: ['src'] });
		const app = row('app')!;
		expect([
			app.getAttribute('aria-level'),
			app.getAttribute('aria-posinset'),
			app.getAttribute('aria-setsize')
		]).toEqual(['2', '2', '2']);
	});
});
