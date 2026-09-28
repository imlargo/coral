/**
 * Runs axe over every component, in the states a page actually puts them in.
 *
 * Repo tooling rather than part of the product, like `coral-manifest.test.ts`: it lives outside
 * `coral/` because only that folder is copied into a project. What it guards is the class of defect
 * that no unit test asks about and every screen reader user meets first - a control with no name, a
 * list with the wrong children, a role that promises keyboard behaviour it does not have.
 *
 * Three rules are off, each for a reason that is not a Coral defect. `color-contrast` is decided by
 * the theme a project installs; Coral has no colours to be wrong about. `region` wants every bit of
 * content inside a landmark, which is a property of a page and not of a component under test.
 * `landmark-banner-is-top-level` objects to the `<header>` the calendar primitive renders for its month
 * heading, inside the popover; that is the primitive's markup. Every other rule runs.
 */

import { render } from 'vitest-browser-svelte';
import { createRawSnippet } from 'svelte';
import type { Snippet } from 'svelte';
import axe from 'axe-core';
import { userEvent } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import ActionButton from './components/coral/kit/action-button/action-button.svelte';
import ActivityCalendar from './components/coral/kit/activity-calendar/activity-calendar.svelte';
import Avatar from './components/coral/kit/avatar/avatar.svelte';
import AvatarStack from './components/coral/kit/avatar-stack/avatar-stack.svelte';
import Combobox from './components/coral/kit/combobox/combobox.svelte';
import CommandPalette from './components/coral/kit/command-palette/command-palette.svelte';
import ConfirmDialog from './components/coral/kit/confirm-dialog/confirm-dialog.svelte';
import CopyButton from './components/coral/kit/copy-button/copy-button.svelte';
import DataTable from './components/coral/kit/data-table/data-table.svelte';
import DatePicker from './components/coral/kit/date-picker/date-picker.svelte';
import FileInput from './components/coral/kit/file-input/file-input.svelte';
import FollowScroll from './components/coral/kit/follow-scroll/follow-scroll.svelte';
import InlineEdit from './components/coral/kit/inline-edit/inline-edit.svelte';
import NumberInput from './components/coral/kit/number-input/number-input.svelte';
import PageState from './components/coral/kit/page-state/page-state.svelte';
import PasswordInput from './components/coral/kit/password-input/password-input.svelte';
import RatingGroup from './components/coral/kit/rating-group/rating-group.svelte';
import RelativeTime from './components/coral/kit/relative-time/relative-time.svelte';
import ReorderList from './components/coral/kit/reorder-list/reorder-list.svelte';
import ScrubInput from './components/coral/kit/scrub-input/scrub-input.svelte';
import SearchInput from './components/coral/kit/search-input/search-input.svelte';
import Select from './components/coral/kit/select/select.svelte';
import Shortcut from './components/coral/kit/shortcut/shortcut.svelte';
import ShowMore from './components/coral/kit/show-more/show-more.svelte';
import StepperHarness from './components/coral/kit/stepper/stepper-harness.test.svelte';
import TagsInput from './components/coral/kit/tags-input/tags-input.svelte';
import Textarea from './components/coral/kit/textarea/textarea.svelte';
import Toc from './components/coral/kit/toc/toc.svelte';
import TreeView from './components/coral/kit/tree-view/tree-view.svelte';
import TablePanel from './components/coral/blocks/table-panel/table-panel.svelte';

/** A snippet standing in for whatever a caller puts inside a component. */
const html = (markup: string): Snippet => createRawSnippet(() => ({ render: () => markup }));

/**
 * `render` cannot infer a generic component's parameters, and the cases below are a list of
 * different components, so the cast is made once here rather than at every one.
 */
function draw(component: unknown, props: Record<string, unknown>) {
	return render(component as never, props as never);
}

async function violations(context: Element | Document = document.body) {
	const { violations: found } = await axe.run(context as Element, {
		rules: {
			'color-contrast': { enabled: false },
			region: { enabled: false },
			'landmark-banner-is-top-level': { enabled: false }
		}
	});
	return found.map(
		(violation) =>
			`${violation.id}: ${violation.help}\n${violation.nodes
				.map((node) => `    ${node.target.join(' ')}  ${node.html.slice(0, 140)}`)
				.join('\n')}`
	);
}

const fruits = [
	{ value: 1, label: 'Açaí' },
	{ value: 2, label: 'Guava' },
	{ value: 3, label: 'Kiwi' }
];
const people = [
	{ name: 'Amara Diallo', src: 'data:,' },
	{ name: 'Wei Zhang' },
	{ name: 'Sofia Rossi' }
];
const rows = [
	{ id: 'a', project: 'Açaí', status: 'ready' },
	{ id: 'b', project: 'Kiwi', status: 'failed' }
];
const columns = [
	{
		id: 'project',
		header: 'Project',
		value: (row: (typeof rows)[number]) => row.project,
		sortable: true
	},
	{ id: 'status', header: 'Status', value: (row: (typeof rows)[number]) => row.status }
];

const cases: [string, () => unknown][] = [
	['action-button', () => draw(ActionButton, { children: html('Save') })],
	['action-button, busy', () => draw(ActionButton, { pending: true, children: html('Save') })],
	[
		'activity-calendar',
		() =>
			draw(ActivityCalendar, {
				data: [{ date: '2026-01-05', count: 3 }],
				start: '2026-01-01',
				end: '2026-03-31',
				caption: 'Deploys'
			})
	],
	['avatar', () => draw(Avatar, { name: 'Amara Diallo' })],
	['avatar-stack', () => draw(AvatarStack, { items: people, max: 3, label: 'Team' })],
	['combobox', () => draw(Combobox, { options: fruits, 'aria-label': 'Fruit' })],
	[
		'combobox, multiple with a selection',
		() =>
			draw(Combobox, { options: fruits, type: 'multiple', value: [1, 2], 'aria-label': 'Fruit' })
	],
	['combobox, open', () => draw(Combobox, { options: fruits, open: true, 'aria-label': 'Fruit' })],
	[
		'command-palette',
		() =>
			draw(CommandPalette, {
				open: true,
				actions: [
					{ id: 'new', label: 'New project', shortcut: 'mod+n', run: () => {} },
					{ id: 'docs', label: 'Open docs', group: 'Help', run: () => {} }
				]
			})
	],
	['confirm-dialog', () => draw(ConfirmDialog, { open: true, title: 'Delete project' })],
	['copy-button', () => draw(CopyButton, { text: 'pnpm add coral' })],
	[
		'data-table',
		() =>
			draw(DataTable, {
				rows,
				columns,
				getRowId: (row: (typeof rows)[number]) => row.id,
				caption: 'Deploys',
				selection: 'multiple',
				selected: ['a']
			})
	],
	[
		'data-table, loading',
		() =>
			draw(DataTable, { rows: [], columns, getRowId: () => '', loading: true, caption: 'Deploys' })
	],
	[
		'data-table, empty',
		() => draw(DataTable, { rows: [], columns, getRowId: () => '', caption: 'Deploys' })
	],
	['date-picker', () => draw(DatePicker, { 'aria-label': 'Start date' })],
	[
		'date-picker, range, open',
		() => draw(DatePicker, { type: 'range', open: true, 'aria-label': 'Period' })
	],
	['file-input', () => draw(FileInput, { 'aria-label': 'Attachments' })],
	[
		'follow-scroll',
		() => draw(FollowScroll, { class: 'h-24', children: html('<p>line</p><p>line</p>') })
	],
	['inline-edit', () => draw(InlineEdit, { value: 'Central Office' })],
	[
		'inline-edit, editing',
		() => draw(InlineEdit, { value: 'Central Office', editing: true, 'aria-label': 'Name' })
	],
	['number-input', () => draw(NumberInput, { value: 3, 'aria-label': 'Seats' })],
	['page-state', () => draw(PageState, { children: html('<p>Deploys</p>') })],
	[
		'page-state, error',
		() => draw(PageState, { error: new Error('x'), onretry: () => {}, children: html('') })
	],
	['password-input', () => draw(PasswordInput, { 'aria-label': 'Password' })],
	['rating-group', () => draw(RatingGroup, { value: 3, label: undefined, 'aria-label': 'Rating' })],
	['rating-group, read only', () => draw(RatingGroup, { value: 3.5, readonly: true })],
	['relative-time', () => draw(RelativeTime, { date: new Date(Date.now() - 5 * 60_000) })],
	[
		'reorder-list',
		() => draw(ReorderList, { items: ['Build', 'Test', 'Deploy'], 'aria-label': 'Pipeline' })
	],
	['scrub-input', () => draw(ScrubInput, { label: 'Width', value: 12 })],
	['search-input', () => draw(SearchInput, { 'aria-label': 'Search', value: 'ki' })],
	['select', () => draw(Select, { options: fruits, 'aria-label': 'Fruit' })],
	['select, open', () => draw(Select, { options: fruits, open: true, 'aria-label': 'Fruit' })],
	['shortcut', () => draw(Shortcut, { keys: 'mod+k' })],
	['show-more', () => draw(ShowMore, { children: html('<p>Some text that may be long.</p>') })],
	['stepper', () => draw(StepperHarness, { steps: ['account', 'plan', 'review'] })],
	[
		'tags-input',
		() => draw(TagsInput, { value: ['a', 'b'], 'aria-label': 'Tags', clearable: true })
	],
	['textarea', () => draw(Textarea, { 'aria-label': 'Notes', maxLength: 100, showCount: true })],
	[
		'toc',
		() =>
			draw(Toc, {
				headings: [
					{ id: 'a', text: 'Install', level: 2 },
					{ id: 'b', text: 'Usage', level: 2 }
				]
			})
	],
	[
		'tree-view',
		() =>
			draw(TreeView, {
				label: 'Files',
				expanded: ['src'],
				nodes: [
					{ id: 'src', label: 'src', children: [{ id: 'app', label: 'app.ts' }] },
					{ id: 'readme', label: 'README.md' }
				]
			})
	],
	[
		'table-panel',
		() =>
			draw(TablePanel, {
				rows,
				columns,
				getRowId: (row: (typeof rows)[number]) => row.id,
				caption: 'Deploys',
				selection: 'multiple',
				pageSize: 1
			})
	],
	// States that change the markup: a selection made, a search that found nothing, files held.
	[
		'select, with a selection and a clear control',
		() => draw(Select, { options: fruits, value: 2, clearable: true, 'aria-label': 'Fruit' })
	],
	[
		'combobox, groups and descriptions, open',
		() =>
			draw(Combobox, {
				open: true,
				'aria-label': 'Fruit',
				options: [
					{ label: 'Berries', options: [{ value: 1, label: 'Açaí', description: 'Berry' }] },
					{ label: 'Tropical', options: [{ value: 2, label: 'Mango', disabled: true }] }
				]
			})
	],
	[
		'combobox, nothing found',
		async () => {
			await draw(Combobox, { options: fruits, open: true, 'aria-label': 'Fruit' });
			await userEvent.fill(document.querySelector('[data-slot="command-input"]')!, 'zzz');
		}
	],
	['date-picker, one day, open', () => draw(DatePicker, { open: true, 'aria-label': 'Due date' })],
	[
		'date-picker, with presets and a clear control',
		() =>
			draw(DatePicker, {
				open: true,
				clearable: true,
				'aria-label': 'Period',
				type: 'range',
				presets: [{ label: 'Today', value: () => ({ start: undefined, end: undefined }) }]
			})
	],
	[
		'data-table, everything selected',
		() =>
			draw(DataTable, {
				rows,
				columns,
				getRowId: (row: (typeof rows)[number]) => row.id,
				caption: 'Deploys',
				selection: 'multiple',
				selected: ['a', 'b'],
				sort: { column: 'project', direction: 'desc' }
			})
	],
	[
		'table-panel, a search that matched nothing',
		() =>
			draw(TablePanel, {
				rows,
				columns,
				getRowId: (row: (typeof rows)[number]) => row.id,
				caption: 'Deploys',
				search: 'zzz'
			})
	],
	[
		'file-input, files held',
		() =>
			draw(FileInput, {
				'aria-label': 'Attachments',
				multiple: true,
				value: [new File(['x'], 'roadmap.pdf'), new File(['y'], 'notes.txt')]
			})
	],
	[
		'stepper, vertical',
		() => draw(StepperHarness, { steps: ['a', 'b', 'c'], orientation: 'vertical' })
	],
	[
		'page-state, loading',
		() => draw(PageState, { loading: true, delay: 0, children: html('<p></p>') })
	],
	[
		'confirm-dialog, waiting',
		() => draw(ConfirmDialog, { open: true, title: 'Delete', pending: true })
	],
	['copy-button, copied', () => draw(CopyButton, { text: 'x', status: 'copied' })],
	[
		'tags-input, read only',
		() => draw(TagsInput, { value: ['a'], readonly: true, 'aria-label': 'Tags' })
	],
	[
		'command-palette, with recents and a disabled action',
		() =>
			draw(CommandPalette, {
				open: true,
				recent: ['docs'],
				actions: [
					{ id: 'new', label: 'New project', run: () => {} },
					{ id: 'docs', label: 'Open docs', run: () => {} },
					{ id: 'off', label: 'Deploy', disabled: true, run: () => {} }
				]
			})
	],
	[
		'tree-view, with a selection',
		() =>
			draw(TreeView, {
				label: 'Files',
				expanded: ['src'],
				selected: 'app',
				nodes: [{ id: 'src', label: 'src', children: [{ id: 'app', label: 'app.ts' }] }]
			})
	],
	[
		'combobox, loading',
		() => draw(Combobox, { options: fruits, open: true, loading: true, 'aria-label': 'Fruit' })
	],
	[
		'command-palette, nothing found',
		async () => {
			await draw(CommandPalette, {
				open: true,
				actions: [{ id: 'new', label: 'New project', run: () => {} }]
			});
			await userEvent.fill(document.querySelector('[data-slot="command-input"]')!, 'zzz');
		}
	],
	[
		'command-palette, loading',
		() =>
			draw(CommandPalette, {
				open: true,
				loading: true,
				actions: [{ id: 'new', label: 'New project', run: () => {} }]
			})
	],
	[
		'select, grouped, open',
		() =>
			draw(Select, {
				open: true,
				'aria-label': 'Fruit',
				options: [
					{ label: 'Berries', options: [{ value: 1, label: 'Açaí' }] },
					{ label: 'Tropical', options: [{ value: 2, label: 'Mango' }] }
				]
			})
	],
	// States reached through the keyboard, which is how the people axe is protecting reach them.
	[
		'reorder-list, an item picked up',
		async () => {
			await draw(ReorderList, { items: ['Build', 'Test', 'Deploy'], 'aria-label': 'Pipeline' });
			document.querySelector<HTMLElement>('[data-coral-handle="0"]')!.focus();
			await userEvent.keyboard(' ');
		}
	],
	[
		'number-input, at its upper bound',
		() => draw(NumberInput, { value: 10, max: 10, 'aria-label': 'Seats' })
	],
	[
		'password-input, shown',
		() => draw(PasswordInput, { visible: true, capsLock: true, 'aria-label': 'Password' })
	]
];

describe('accessibility', () => {
	it.each(cases)('%s has no axe violations', async (_name, build) => {
		await build();
		// Let effects, portals and measured layout settle before looking.
		await new Promise((resolve) => setTimeout(resolve, 50));
		expect(await violations()).toEqual([]);
	});
});
