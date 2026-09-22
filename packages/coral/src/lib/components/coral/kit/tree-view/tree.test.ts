/**
 * @coral/kit/tree-view
 * @version 1.0.1
 */

import { describe, expect, it } from 'vitest';
import { ancestorsOf, expandableSiblings, typeahead, visibleRows } from './tree.js';
import type { TreeNode } from './tree.js';

const tree: TreeNode[] = [
	{
		id: 'src',
		label: 'src',
		children: [
			{
				id: 'lib',
				label: 'lib',
				children: [{ id: 'utils', label: 'utils.ts' }]
			},
			{ id: 'app', label: 'app.html' },
			{ id: 'routes', label: 'routes', children: [] }
		]
	},
	{ id: 'readme', label: 'README.md' },
	{ id: 'ananas', label: 'Ánanas.md' }
];

const ids = (rows: { node: TreeNode }[]) => rows.map((row) => row.node.id);

describe('visibleRows', () => {
	it('shows only the top level when nothing is expanded', () => {
		expect(ids(visibleRows(tree, new Set()))).toEqual(['src', 'readme', 'ananas']);
	});

	it('shows the children of expanded nodes, in reading order', () => {
		const rows = visibleRows(tree, new Set(['src', 'lib']));
		expect(ids(rows)).toEqual(['src', 'lib', 'utils', 'app', 'routes', 'readme', 'ananas']);
	});

	it('hides a child whose parent is collapsed, even if the child is expanded', () => {
		expect(ids(visibleRows(tree, new Set(['lib'])))).toEqual(['src', 'readme', 'ananas']);
	});

	it('records level, position and set size', () => {
		const utils = visibleRows(tree, new Set(['src', 'lib'])).find((row) => row.node.id === 'utils');
		expect(utils).toMatchObject({ level: 3, parentId: 'lib', position: 1, siblings: 1 });

		const app = visibleRows(tree, new Set(['src'])).find((row) => row.node.id === 'app');
		expect(app).toMatchObject({ level: 2, position: 2, siblings: 3 });
	});

	it('treats an empty children array as an expandable branch', () => {
		const routes = visibleRows(tree, new Set(['src'])).find((row) => row.node.id === 'routes');
		expect(routes?.expandable).toBe(true);

		const readme = visibleRows(tree, new Set()).find((row) => row.node.id === 'readme');
		expect(readme?.expandable).toBe(false);
	});
});

describe('ancestorsOf', () => {
	it('lists ancestors nearest first', () => {
		expect(ancestorsOf(tree, 'utils')).toEqual(['lib', 'src']);
	});

	it('is empty for a top-level or unknown node', () => {
		expect(ancestorsOf(tree, 'readme')).toEqual([]);
		expect(ancestorsOf(tree, 'nope')).toEqual([]);
	});
});

describe('expandableSiblings', () => {
	it('lists the expandable nodes on the same level', () => {
		const rows = visibleRows(tree, new Set(['src']));
		const app = rows.find((row) => row.node.id === 'app')!;
		expect(expandableSiblings(rows, app)).toEqual(['lib', 'routes']);
	});
});

describe('typeahead', () => {
	const rows = visibleRows(tree, new Set(['src']));
	// src, lib, app, routes, readme, ananas

	it('finds the next label starting with a letter', () => {
		expect(ids([rows[typeahead(rows, 0, 'r')]])).toEqual(['routes']);
	});

	it('moves on to the next match when the same letter is pressed again', () => {
		const first = typeahead(rows, 0, 'r');
		expect(rows[typeahead(rows, first, 'r')].node.id).toBe('readme');
		expect(rows[typeahead(rows, first, 'rr')].node.id).toBe('readme');
	});

	it('wraps around', () => {
		expect(rows[typeahead(rows, 4, 's')].node.id).toBe('src');
	});

	it('ignores case and accents', () => {
		expect(rows[typeahead(rows, 0, 'an')].node.id).toBe('ananas');
		expect(rows[typeahead(rows, 0, 'READ')].node.id).toBe('readme');
	});

	it('keeps the current row when a longer query still matches it', () => {
		expect(typeahead(rows, 3, 'rou')).toBe(3);
	});

	it('is -1 with no match', () => {
		expect(typeahead(rows, 0, 'z')).toBe(-1);
	});
});
