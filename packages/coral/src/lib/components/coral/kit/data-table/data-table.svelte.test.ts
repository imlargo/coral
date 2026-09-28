/**
 * @coral/kit/data-table
 * @version 1.0.1
 */

import { render } from 'vitest-browser-svelte';
import type { ComponentProps } from 'svelte';
import { userEvent } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import DataTable from './data-table.svelte';
import type { Column, DataTableProps, Sort } from './types.js';

/**
 * `render` takes a props object, so it cannot infer the component's `T` and lands on `unknown` -
 * the same harness problem kit/select's test documents. The cast lives here rather than in the
 * component's own typing.
 */
function renderTable(props: DataTableProps<Deploy>) {
	return render(DataTable, props as unknown as ComponentProps<typeof DataTable>);
}

type Deploy = { id: string; project: string; duration: number | null };

const rows: Deploy[] = [
	{ id: 'a', project: 'Açaí', duration: 42 },
	{ id: 'b', project: 'Kiwi', duration: null },
	{ id: 'c', project: 'Mango', duration: 9 }
];

const columns: Column<Deploy>[] = [
	{ id: 'project', header: 'Project', value: (row) => row.project, sortable: true },
	{ id: 'duration', header: 'Duration', value: (row) => row.duration, align: 'end' }
];

const base = { rows, columns, getRowId: (row: Deploy) => row.id };

const bodyRows = () => Array.from(document.querySelectorAll('tbody tr'));
const cells = () => bodyRows().map((row) => row.querySelector('td')?.textContent?.trim());
const checkboxes = () => Array.from(document.querySelectorAll<HTMLElement>('[role="checkbox"]'));

describe('sorting', () => {
	it('reports the press and walks ascending, descending, none', async () => {
		const onsortchange = vi.fn();
		const props = $state({ ...base, onsortchange, sort: undefined as Sort | undefined });
		await renderTable(props);

		const header = document.querySelector<HTMLButtonElement>('[data-column="project"]')!;
		await userEvent.click(header);
		expect(props.sort).toEqual({ column: 'project', direction: 'asc' });

		await userEvent.click(header);
		expect(props.sort).toEqual({ column: 'project', direction: 'desc' });

		await userEvent.click(header);
		expect(props.sort).toBeUndefined();
		expect(onsortchange).toHaveBeenCalledTimes(3);
	});

	it('announces the direction on the header cell', async () => {
		const props = $state({ ...base, sort: undefined as Sort | undefined });
		await renderTable(props);
		const head = () => document.querySelector('th[aria-sort]')!;

		expect(head().getAttribute('aria-sort')).toBe('none');
		await userEvent.click(document.querySelector<HTMLButtonElement>('[data-column="project"]')!);
		await expect.poll(() => head().getAttribute('aria-sort')).toBe('ascending');
	});

	it('offers no control on a column that is not sortable', async () => {
		await renderTable(base);
		expect(document.querySelector('[data-column="duration"]')).toBeNull();
	});

	it('leaves the rows exactly as it was given them', async () => {
		const props = $state({ ...base, sort: undefined as Sort | undefined });
		await renderTable(props);

		await userEvent.click(document.querySelector<HTMLButtonElement>('[data-column="project"]')!);
		// Sorting is the caller's: the table reports the press and redraws what it is handed.
		expect(cells()).toEqual(['Açaí', 'Kiwi', 'Mango']);
	});
});

describe('selection', () => {
	it('picks a row and reports it', async () => {
		const onselectionchange = vi.fn();
		const props = $state({
			...base,
			selection: 'multiple' as const,
			onselectionchange,
			selected: [] as string[]
		});
		await renderTable(props);

		// The first checkbox is the header's.
		await userEvent.click(checkboxes()[1]);
		expect(props.selected).toEqual(['a']);
		expect(onselectionchange).toHaveBeenCalledWith(['a']);
	});

	it('extends from the last row picked when Shift is held', async () => {
		const props = $state({ ...base, selection: 'multiple' as const, selected: [] as string[] });
		await renderTable(props);

		await userEvent.click(checkboxes()[1]);
		await userEvent.keyboard('{Shift>}');
		await userEvent.click(checkboxes()[3]);
		await userEvent.keyboard('{/Shift}');

		expect(props.selected).toEqual(['a', 'b', 'c']);
	});

	it('keeps one row at a time in single mode', async () => {
		const props = $state({ ...base, selection: 'single' as const, selected: [] as string[] });
		await renderTable(props);

		await userEvent.click(checkboxes()[0]);
		await userEvent.click(checkboxes()[1]);
		expect(props.selected).toEqual(['b']);
	});

	it('walks the header checkbox through its three states', async () => {
		const props = $state({ ...base, selection: 'multiple' as const, selected: [] as string[] });
		await renderTable(props);
		const header = () => checkboxes()[0];

		await userEvent.click(header());
		expect(props.selected).toEqual(['a', 'b', 'c']);
		await expect.poll(() => header().getAttribute('aria-checked')).toBe('true');

		// One row off makes it partly selected, which has to read as mixed rather than as empty.
		await userEvent.click(checkboxes()[1]);
		await expect.poll(() => header().getAttribute('aria-checked')).toBe('mixed');

		// Pressing a mixed checkbox completes the selection, the way a tri-state checkbox does
		// natively; it does not throw away what was already picked.
		await userEvent.click(header());
		expect([...props.selected].sort()).toEqual(['a', 'b', 'c']);

		await userEvent.click(header());
		expect(props.selected).toEqual([]);
	});

	it('draws no checkboxes at all without a selection mode', async () => {
		await renderTable(base);
		expect(checkboxes()).toHaveLength(0);
	});
});

describe('row activation', () => {
	it('activates on click and on Enter, once', async () => {
		const onrowactivate = vi.fn();
		await renderTable({ ...base, onrowactivate });

		await userEvent.click(bodyRows()[2]);
		expect(onrowactivate).toHaveBeenCalledExactlyOnceWith(rows[2]);

		(bodyRows()[0] as HTMLElement).focus();
		await userEvent.keyboard('{Enter}');
		expect(onrowactivate).toHaveBeenCalledTimes(2);
	});

	it('does not fire when the press landed on a control inside the row', async () => {
		const onrowactivate = vi.fn();
		await renderTable({ ...base, selection: 'multiple' as const, onrowactivate });

		await userEvent.click(checkboxes()[1]);
		expect(onrowactivate).not.toHaveBeenCalled();
	});

	it('leaves rows out of the tab order when there is nothing to activate', async () => {
		await renderTable(base);
		expect(bodyRows()[0].hasAttribute('tabindex')).toBe(false);
	});
});

describe('states', () => {
	it('draws placeholder rows while loading, and hides them from assistive tech', async () => {
		await renderTable({ ...base, rows: [], loading: true, loadingRows: 3 });

		expect(bodyRows()).toHaveLength(3);
		expect(bodyRows()[0].getAttribute('aria-hidden')).toBe('true');
		expect(document.querySelector('[aria-busy="true"]')).not.toBeNull();
	});

	it('shows the empty state only when nothing is loading', async () => {
		const props = $state({ ...base, rows: [] as Deploy[], loading: true });
		await renderTable(props);
		expect(document.body.textContent).not.toContain('Nothing to show.');

		props.loading = false;
		await expect.poll(() => document.body.textContent).toContain('Nothing to show.');
	});

	it('spans the empty state across every column', async () => {
		await renderTable({ ...base, rows: [], selection: 'multiple' as const });
		expect(document.querySelector('tbody td')?.getAttribute('colspan')).toBe('3');
	});
});
