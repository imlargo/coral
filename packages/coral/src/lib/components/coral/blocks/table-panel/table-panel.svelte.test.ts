/**
 * @coral/blocks/table-panel
 * @version 1.0.0
 */

import { render } from 'vitest-browser-svelte';
import { createRawSnippet } from 'svelte';
import { userEvent } from 'vitest/browser';
import { describe, expect, it } from 'vitest';
import type { ComponentProps } from 'svelte';
import TablePanel from './table-panel.svelte';
import type { TablePanelProps } from './types.js';
import type { Column } from '../../kit/data-table/types.js';

type Run = { id: string; project: string; status: string };

/** Twelve runs, so a page holds some of them and a search reaches past the first page. */
const runs: Run[] = Array.from({ length: 12 }, (_, index) => ({
	id: String(index + 1),
	project: ['Açaí', 'Kiwi', 'Mango', 'Papaya'][index % 4],
	status: index % 3 === 0 ? 'failed' : 'ready'
}));

const columns: Column<Run>[] = [
	{ id: 'project', header: 'Project', value: (row) => row.project, sortable: true },
	{ id: 'status', header: 'Status', value: (row) => row.status }
];

/**
 * `render` takes a props object, so it cannot infer the component's `T` and lands on `unknown` -
 * the same harness problem kit/select's test documents.
 */
function renderPanel(props: Partial<TablePanelProps<Run>> = {}) {
	return renderWith({ rows: runs, columns, getRowId: (row: Run) => row.id, pageSize: 5, ...props });
}

/**
 * Renders the object it is given rather than a copy of it, which is what a bindable prop needs:
 * the component writes back through the same proxy the test then reads.
 */
function renderWith(props: Partial<TablePanelProps<Run>>) {
	return render(TablePanel, props as unknown as ComponentProps<typeof TablePanel>);
}

/** A bulk bar has to exist for the selection count to have somewhere to show. */
const bulk = createRawSnippet(() => ({
	render: () => '<button type="button">Cancel runs</button>'
}));

const panelProps = (extra: Partial<TablePanelProps<Run>>) => ({
	rows: runs,
	columns,
	getRowId: (row: Run) => row.id,
	pageSize: 5,
	...extra
});

const cells = () =>
	Array.from(document.querySelectorAll('tbody tr td:first-child')).map((cell) =>
		cell.textContent?.trim()
	);
const range = () => document.querySelector('tbody')?.closest('div')?.textContent ?? '';
const search = () => document.querySelector<HTMLInputElement>('input[type="search"]')!;
const rangeText = () =>
	Array.from(document.querySelectorAll('p')).find((p) => /of \d+/.test(p.textContent ?? ''))
		?.textContent;

describe('paging', () => {
	it('shows one page and says which rows they are', async () => {
		await renderPanel();
		expect(cells()).toHaveLength(5);
		expect(rangeText()).toBe('1-5 of 12');
	});

	it('walks to the next page', async () => {
		await renderPanel();
		await userEvent.click(document.querySelector('[aria-label="Go to next page"]')!);
		await expect.poll(rangeText).toBe('6-10 of 12');
	});

	it('goes back to the first page when the page size changes', async () => {
		await renderPanel();
		await userEvent.click(document.querySelector('[aria-label="Go to next page"]')!);
		await expect.poll(rangeText).toBe('6-10 of 12');

		const sizes = document.querySelector<HTMLSelectElement>('select')!;
		await userEvent.selectOptions(sizes, '25');
		await expect.poll(rangeText).toBe('1-12 of 12');
	});

	it('hides the paginator when everything fits', async () => {
		await renderPanel({ pageSize: 50 });
		expect(document.querySelector('[aria-label="Go to next page"]')).toBeNull();
	});
});

describe('searching', () => {
	it('searches every row, not just the page on screen', async () => {
		await renderPanel();
		// Papaya's runs are 4, 8 and 12: two of them start off-page.
		await userEvent.fill(search(), 'papaya');
		await expect.poll(cells).toEqual(['Açaí', 'Açaí', 'Açaí'].fill('Papaya'));
	});

	it('folds accents, so the search matches what is typed', async () => {
		await renderPanel();
		await userEvent.fill(search(), 'acai');
		await expect.poll(() => cells().length).toBe(3);
	});

	it('brings a page past the end back, instead of showing an empty table', async () => {
		await renderPanel();
		await userEvent.click(document.querySelector('[aria-label="Go to next page"]')!);
		await expect.poll(rangeText).toBe('6-10 of 12');

		await userEvent.fill(search(), 'papaya');
		await expect.poll(rangeText).toBe('1-3 of 3');
		expect(cells()).toHaveLength(3);
	});

	it('leaves what was typed in the field alone once the search has settled', async () => {
		const props = $state(panelProps({ search: '' }));
		await renderWith(props);

		await userEvent.type(search(), 'ana ');
		// Past the input's own debounce, which is when the trimmed term is written back.
		await expect.poll(() => props.search).toBe('ana');
		expect(search().value).toBe('ana ');
	});

	it('follows a search that is set from code', async () => {
		const props = $state(panelProps({ search: 'papaya' }));
		await renderWith(props);
		expect(search().value).toBe('papaya');

		props.search = '';
		await expect.poll(() => search().value).toBe('');
		await expect.poll(() => cells().length).toBe(5);
	});

	it('says something different when a search matched nothing', async () => {
		await renderPanel({ emptyTitle: 'No runs yet.', noResultsTitle: 'No runs match that.' });
		await userEvent.fill(search(), 'lychee');
		await expect.poll(() => range()).toContain('No runs match that.');
	});

	it('says the other thing when there is nothing at all', async () => {
		await renderPanel({ rows: [], emptyTitle: 'No runs yet.' });
		expect(range()).toContain('No runs yet.');
	});
});

describe('bulk actions', () => {
	it('offers them only once something is selected, with a count', async () => {
		const props = $state(panelProps({ selection: 'multiple', selected: [], bulk }));
		await renderWith(props);

		expect(document.body.textContent).not.toContain('selected');

		await userEvent.click(document.querySelectorAll<HTMLElement>('[role="checkbox"]')[1]);
		expect(props.selected).toEqual(['1']);
		await expect.poll(() => document.body.textContent).toContain('1 selected');
	});

	it('clears the selection from the bar', async () => {
		const props = $state(panelProps({ selection: 'multiple', selected: [], bulk }));
		await renderWith(props);

		await userEvent.click(document.querySelectorAll<HTMLElement>('[role="checkbox"]')[1]);
		await expect.poll(() => props.selected).toEqual(['1']);

		const clear = Array.from(document.querySelectorAll('button')).find(
			(button) => button.textContent?.trim() === 'Clear selection'
		)!;
		await userEvent.click(clear);
		expect(props.selected).toEqual([]);
	});

	it('keeps a selection made on a page that is no longer showing', async () => {
		const props = $state(panelProps({ selection: 'multiple', selected: [], bulk }));
		await renderWith(props);

		await userEvent.click(document.querySelectorAll<HTMLElement>('[role="checkbox"]')[1]);
		await expect.poll(() => props.selected).toEqual(['1']);

		await userEvent.click(document.querySelector('[aria-label="Go to next page"]')!);
		await expect.poll(rangeText).toBe('6-10 of 12');
		// Row 1 is off screen, and still selected.
		expect(props.selected).toEqual(['1']);
	});
});
