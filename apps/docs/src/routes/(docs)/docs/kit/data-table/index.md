---
title: Data table
description: Rows with sortable headers, selection that survives a sort, and its own loading and empty states.
---

<script lang="ts">
	import Preview from '$docs/preview.svelte';
</script>

`ui/table` is markup: eight elements that draw a grid and know nothing. Everything that makes a
table a table gets written again per screen - which header is sorted and which way, what the arrow
means on the third press, a header checkbox that has to say "some of them", a Shift-click that takes
a range, skeleton rows that keep the layout still, and an empty state that spans the columns instead
of hiding in the first one.

<Preview name="kit/data-table/basic" class="min-h-96" />

## What Coral adds

- **Three-state sorting.** Ascending, descending, then back to the order the rows arrived in, which
  is usually the order the server chose. The header cell carries `aria-sort`, and the control inside
  it is a real button.
- **Selection that survives.** Rows are remembered by id, so sorting, filtering or reloading does not
  move the selection onto different rows. Shift takes a range from the last row picked.
- **A header checkbox that tells the truth.** Checked, mixed, or empty, read against the rows on
  screen. Pressing it while mixed completes the selection, the way a tri-state checkbox behaves
  natively; the next press clears it.
- **Loading that does not jump.** Placeholder rows keep the column widths the real rows are about to
  have, and are hidden from assistive tech, which hears `aria-busy` instead.
- **An empty state in the table.** Spanning every column, only once nothing is loading.
- **Rows you can click, when that means something.** Pass `onrowactivate` and rows become reachable
  and pressable with Enter; a press that landed on a checkbox, a link or a row action does not fire
  it as well.

## Who sorts the rows

The table draws what it is handed, and reports what the reader pressed. That one decision is what
lets the same component serve a page holding its own array and a screen whose server does the
sorting: one passes the rows through `sortRows`, the other puts the sort in a query.

```svelte
<script lang="ts">
	import { sortRows } from '$lib/components/coral/lib/table.js';

	let sort = $state({ column: 'project', direction: 'asc' });
	const rows = $derived(sortRows(deploys, sort, { value: (row, column) => row[column] }));
</script>

<DataTable {rows} {columns} getRowId={(row) => row.id} bind:sort />
```

## Selection, search and a bulk action

<Preview name="kit/data-table/selection" class="min-h-96" />

`filterRows` matches every word of the term against the whole row, in any order and any field, and
folds accents through the same [`lib/fold`](/docs/kit/combobox) the combobox searches with. Paging
is in the same module: `paginate`, `pageCount` and a `clampPage` that holds a page past the end at
the last one instead of showing an empty screen.

## Loading and empty

<Preview name="kit/data-table/states" class="min-h-80" />

## Columns

```ts
type Column<T> = {
	id: string; // names the column in `sort` and wherever a cell is addressed
	header?: string | Snippet; // defaults to the id
	value?: (row: T) => string | number | boolean | Date | null | undefined;
	cell?: Snippet<[{ row: T; index: number }]>; // renders it; without one, `value` is shown as text
	sortable?: boolean;
	align?: 'start' | 'center' | 'end';
	class?: string;
};
```

`value` is what the column _is_: what it shows, what it sorts by, and what a search matches. `cell`
is how it looks. A column that holds a date should have both - the date for sorting, a snippet to
render it - because a `Date` printed as text is nobody's idea of a date.

## Import

```svelte
<script lang="ts">
	import DataTable from '$lib/components/coral/kit/data-table/data-table.svelte';
</script>
```

## Props

Everything a `<div>` accepts stays available on the root. On top of that:

| Prop                | Type                                | Default            | Description                                                 |
| ------------------- | ----------------------------------- | ------------------ | ----------------------------------------------------------- |
| `rows`              | `readonly T[]`                      | -                  | The rows to draw, already sorted and paged. Required.       |
| `columns`           | `readonly Column<T>[]`              | -                  | The columns, in order. Required.                            |
| `getRowId`          | `(row: T) => string`                | -                  | A row's identity, stable across sorts. Required.            |
| `sort`              | `Sort`                              | -                  | Bindable. `{ column, direction }`.                          |
| `onsortchange`      | `(sort: Sort \| undefined) => void` | -                  | A header was pressed. Never on mount.                       |
| `selection`         | `'none' \| 'single' \| 'multiple'`  | `'none'`           | Whether rows can be picked.                                 |
| `selected`          | `string[]`                          | `[]`               | Bindable. Ids of the selected rows.                         |
| `onselectionchange` | `(selected: string[]) => void`      | -                  | The selection changed.                                      |
| `onrowactivate`     | `(row: T) => void`                  | -                  | A row was clicked or activated with Enter.                  |
| `loading`           | `boolean`                           | `false`            | Draws placeholder rows.                                     |
| `loadingRows`       | `number`                            | `5`                | How many.                                                   |
| `emptyMessage`      | `string`                            | `Nothing to show.` | Shown when there are no rows.                               |
| `caption`           | `string`                            | -                  | Names the table. Rendered visually hidden.                  |
| `stickyHeader`      | `boolean`                           | `false`            | Keeps the header in view while the body scrolls.            |
| `selectAllLabel`    | `string`                            | `Select all rows`  | Accessible label for the header checkbox.                   |
| `selectRowLabel`    | `(row: T) => string`                | `Select row`       | Accessible label for a row's checkbox.                      |
| `class`             | `string`                            | -                  | Merged onto the root.                                       |
| `rowClass`          | `string`                            | -                  | Merged onto every body row.                                 |
| `empty`             | `Snippet`                           | -                  | Replaces the empty state.                                   |
| `footer`            | `Snippet`                           | -                  | Rendered below the table - pagination, a count, a bulk bar. |

## Accessibility

A real `<table>` with a real header, so assistive tech announces rows and columns and the caption
names the whole thing. Sortable headers carry `aria-sort` on the cell and a button inside it; the
selection checkboxes are labelled per row, because "Select" repeated eight times names nothing.
Placeholder rows are `aria-hidden` and the region is `aria-busy` while they show.

## What is deliberately not here

Pagination controls, column visibility, filters and a toolbar. They are the difference between a
table and a table _screen_, they are where a project's own layout shows up, and they are the first
thing a `blocks/` composition will put around this. `footer` is the seam meanwhile.

## lib/table

Every rule above is a plain function, exported on its own and tested as such - so a list that is not
a table can sort and filter exactly the way the table does:

```ts
import { filterRows, nextSort, paginate, sortRows } from '$lib/components/coral/lib/table.js';

nextSort({ column: 'name', direction: 'desc' }, 'name'); // undefined - back to no sort
sortRows(rows, sort, { value }); // stable, blanks last in both directions
filterRows(rows, 'acai ready', (row) => [row.project, row.status]);
paginate(rows, 7, 10); // a page past the end gives the last one
```
