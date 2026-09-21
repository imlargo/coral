/**
 * @coral/kit/tree-view
 * @version 1.0.0
 */

import { render } from 'vitest-browser-svelte';
import { userEvent } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import TreeView from './tree-view.svelte';
import type { TreeNode } from './tree.js';

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
		await render(TreeView, { nodes, label: 'Archivos' });
		const tabbable = document.querySelectorAll('[role="treeitem"][tabindex="0"]');
		expect(tabbable.length).toBe(1);
	});

	it('walks the tree with the arrow keys', async () => {
		await render(TreeView, { nodes, label: 'Archivos' });
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
		await render(TreeView, { nodes, label: 'Archivos', expanded: ['src', 'lib'] });
		row('utils')!.focus();

		// Close `src` by clicking its chevron, which hides the focused row.
		const chevron = row('src')!.querySelector<HTMLElement>('[aria-hidden="true"]')!;
		await userEvent.click(chevron);
		await expect.poll(focusedId).toBe('src');
	});

	it('jumps by typed letters', async () => {
		await render(TreeView, { nodes, label: 'Archivos' });
		row('src')!.focus();

		await userEvent.keyboard('r');
		await expect.poll(focusedId).toBe('readme');
	});
});

describe('selection', () => {
	it('selects with Enter and reports it', async () => {
		const onselect = vi.fn();
		await render(TreeView, { nodes, label: 'Archivos', onselect });
		row('readme')!.focus();

		await userEvent.keyboard('{Enter}');
		expect(onselect).toHaveBeenCalledWith(expect.objectContaining({ id: 'readme' }));
		expect(row('readme')?.getAttribute('aria-selected')).toBe('true');
	});

	it('never selects a disabled node', async () => {
		const onselect = vi.fn();
		await render(TreeView, { nodes, label: 'Archivos', expanded: ['src'], onselect });
		row('app')!.focus();

		await userEvent.keyboard('{Enter}');
		expect(onselect).not.toHaveBeenCalled();
	});
});

describe('structure', () => {
	it('carries level, position and set size on every row', async () => {
		await render(TreeView, { nodes, label: 'Archivos', expanded: ['src'] });
		const app = row('app')!;
		expect([
			app.getAttribute('aria-level'),
			app.getAttribute('aria-posinset'),
			app.getAttribute('aria-setsize')
		]).toEqual(['2', '2', '2']);
	});
});
