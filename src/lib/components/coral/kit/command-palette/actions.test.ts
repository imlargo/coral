/**
 * @coral/kit/command-palette
 * @version 1.0.0
 */

import { describe, expect, it } from 'vitest';
import { group, remember, searchValue } from './actions.js';
import type { CommandAction } from './actions.js';

const action = (id: string, extra: Partial<CommandAction> = {}): CommandAction => ({
	id,
	label: id,
	run: () => {},
	...extra
});

const actions = [
	action('new', { group: 'Create' }),
	action('import', { group: 'Create' }),
	action('settings', { group: 'Account' }),
	action('logout', { group: 'Account', disabled: true }),
	action('help')
];

const labels = (groups: { label?: string; actions: CommandAction[] }[]) =>
	groups.map((entry) => [entry.label, entry.actions.map((one) => one.id)]);

describe('searchValue', () => {
	it('gathers everything an action can be found by', () => {
		const value = searchValue(
			action('new', {
				label: 'New project',
				description: 'From a template',
				keywords: ['scaffold'],
				group: 'Create'
			})
		);
		expect(value).toBe('New project From a template scaffold Create');
	});

	it('leaves out what an action does not carry', () => {
		expect(searchValue(action('help', { label: 'Help' }))).toBe('Help');
	});
});

describe('group', () => {
	it('keeps groups in the order their first action appears', () => {
		expect(labels(group(actions))).toEqual([
			['Create', ['new', 'import']],
			['Account', ['settings', 'logout']],
			[undefined, ['help']]
		]);
	});

	it('lifts recents into their own group, most recent first', () => {
		expect(labels(group(actions, { recent: ['settings', 'new'] }))).toEqual([
			['Recent', ['settings', 'new']],
			['Create', ['import']],
			['Account', ['logout']],
			[undefined, ['help']]
		]);
	});

	it('never lists a lifted action twice', () => {
		const grouped = group(actions, { recent: ['new'] });
		const ids = grouped.flatMap((entry) => entry.actions.map((one) => one.id));
		expect(ids).toEqual([...new Set(ids)]);
	});

	it('caps the recents', () => {
		const grouped = group(actions, { recent: ['help', 'settings', 'import'], maxRecent: 2 });
		expect(grouped[0].actions.map((one) => one.id)).toEqual(['help', 'settings']);
	});

	it('skips a remembered action that is gone or disabled, without touching the rest', () => {
		const grouped = group(actions, { recent: ['deleted', 'logout', 'help'] });
		expect(grouped[0].actions.map((one) => one.id)).toEqual(['help']);
	});

	it('renders no recent group when nothing was remembered', () => {
		expect(group(actions, { recent: [] })[0].label).toBe('Create');
	});

	it('leaves the order of everything else alone', () => {
		const without = labels(group(actions)).slice(1);
		const with_ = labels(group(actions, { recent: ['new'] })).slice(2);
		expect(with_).toEqual(without);
	});
});

describe('remember', () => {
	it('puts the newest first', () => {
		expect(remember(['a', 'b'], 'c')).toEqual(['c', 'a', 'b']);
	});

	it('moves a repeat rather than duplicating it', () => {
		expect(remember(['a', 'b', 'c'], 'c')).toEqual(['c', 'a', 'b']);
	});

	it('caps the list', () => {
		expect(remember(['a', 'b', 'c'], 'd', 3)).toEqual(['d', 'a', 'b']);
	});
});
