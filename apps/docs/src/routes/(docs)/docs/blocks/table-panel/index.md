---
title: Table panel
description: A table with the screen around it - search, paging, bulk actions, and two different empty states.
---

<script lang="ts">
	import Preview from '$docs/preview.svelte';
</script>

The first block. [Data table](/docs/kit/data-table) draws rows and reports what was pressed; it
deliberately stops there. What surrounds it is the same on every list screen and is where the
mistakes live: a search that only looks at the page on screen, a paginator that points at page 7 of
a list the search cut down to one, an empty table that says "nothing here" when what it means is
"nothing matches that", and a bulk-action bar that pushes the rows down the moment a checkbox is
ticked.

<Preview name="blocks/table-panel/basic" class="min-h-[34rem]" />

## What this block wires

- **The pipeline, in the one order that is correct:** filter, then sort, then cut to the page.
  Paging first is the bug that looks like it works - page 1 of 23 rows is ten rows, and the search
  quietly runs over those ten only.
- **The page follows the rows.** Search something on page 3 and the panel lands on the last page
  that exists, and the paginator agrees with the table instead of highlighting a page nobody is on.
- **Two empty states.** Nothing yet, and nothing found: different situations, different sentences.
- **Selection that outlives the page.** Rows are remembered by id, so a row picked on page 1 is still
  picked after paging, sorting or searching - and the bulk snippet gets the rows themselves, not the
  ids to look up.
- **A bulk bar that does not move the table.** It takes the end of the toolbar rather than a row of
  its own, so ticking a checkbox does not push every row down under the pointer.
- **Rows per page that resets to page 1**, because the row at the top of page 3 is not on page 3 of a
  list cut into different pieces.

## Your own filters

<Preview name="blocks/table-panel/filters" class="min-h-96" />

The `toolbar` snippet is the seam for anything the panel does not own - a scope select, a date
range, a view switch. Filter the rows going in and hand the result over; the panel searches, sorts
and pages whatever it is given.

## Where the data comes from

This block does the work in the browser, over rows it already has. That is the shape of most list
screens, and it is why the pipeline can live here at all.

For a list the server pages, use [data table](/docs/kit/data-table) directly: it takes the rows for
the current page, reports the sort, and leaves the query to you. The pure functions the panel is
built from - `filterRows`, `sortRows`, `paginate`, `clampPage` - are in
[`lib/table`](/docs/kit/data-table) either way.

## Import

```svelte
<script lang="ts">
	import TablePanel from '$lib/components/coral/blocks/table-panel/table-panel.svelte';
</script>
```

Installing it brings the components it composes with it: data table, search input and the shared
`lib/table`, plus the shadcn primitives each of those needs.

## Props

Everything a `<div>` accepts stays available on the root. On top of that:

| Prop                   | Type                                       | Default                   | Description                                      |
| ---------------------- | ------------------------------------------ | ------------------------- | ------------------------------------------------ |
| `rows`                 | `readonly T[]`                             | -                         | Every row there is. Required.                    |
| `columns`              | `readonly Column<T>[]`                     | -                         | Same columns the data table takes. Required.     |
| `getRowId`             | `(row: T) => string`                       | -                         | A row's identity. Required.                      |
| `search`               | `string`                                   | `''`                      | Bindable.                                        |
| `searchText`           | `(row: T) => cells[]`                      | every column's value      | What a search matches against.                   |
| `searchable`           | `boolean`                                  | `true`                    | Drops the search field.                          |
| `searchPlaceholder`    | `string`                                   | `Search`                  | And the field's accessible name.                 |
| `sort`                 | `Sort`                                     | -                         | Bindable.                                        |
| `sorting`              | `{ locale?, compare? }`                    | -                         | Per-column comparison the values cannot express. |
| `page`                 | `number`                                   | `1`                       | Bindable. Written back when it is clamped.       |
| `pageSize`             | `number`                                   | `10`                      | Bindable. `0` puts everything on one page.       |
| `pageSizes`            | `number[]`                                 | `[10, 25, 50]`            | The sizes on offer. Empty hides the chooser.     |
| `selection`            | `'none' \| 'single' \| 'multiple'`         | `'none'`                  | Passed to the table.                             |
| `selected`             | `string[]`                                 | `[]`                      | Bindable.                                        |
| `loading`              | `boolean`                                  | `false`                   | Skeleton rows in the table.                      |
| `emptyTitle`           | `string`                                   | `Nothing here yet.`       | When there are no rows at all.                   |
| `emptyDescription`     | `string`                                   | -                         | What would put something here.                   |
| `noResultsTitle`       | `string`                                   | `No results.`             | When a search matched nothing.                   |
| `noResultsDescription` | `string`                                   | `Try a different search.` | Line under it.                                   |
| `caption`              | `string`                                   | -                         | Names the table for assistive tech.              |
| `rangeLabel`           | `({ from, to, matched, total }) => string` | `1-10 of 42`              | Reads the range under the table.                 |
| `selectedLabel`        | `(count: number) => string`                | `3 selected`              | Reads the selection count.                       |
| `clearLabel`           | `string`                                   | `Clear selection`         | Label of the control that empties the selection. |
| `pageSizeLabel`        | `string`                                   | `Rows per page`           | Label of the rows-per-page chooser.              |
| `toolbar`              | `Snippet`                                  | -                         | Extra controls beside the search field.          |
| `bulk`                 | `Snippet<[{ rows, ids, clear }]>`          | -                         | What can be done to the selected rows.           |

## Accessibility

The table, its sortable headers and its selection semantics are
[data table](/docs/kit/data-table)'s. The paginator is shadcn's, which is a `nav` with its own
labelled controls and a current page marked with `aria-current`. Rows per page is a native
`<select>` inside a real `<label>` - a short list of known numbers, and the control every reader
already knows.

The bulk bar appears and disappears with the selection. It is placed after the search field in the
DOM as well as on screen, so moving through the toolbar reaches it in the order it is read.

## What is deliberately not here

No column visibility menu, no saved views, no URL syncing, no fetching. The first three are the
next things this block will grow when they have been written enough times; the last one is not
coming - a block that fetches is a block that has opinions about your data layer.
