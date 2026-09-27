<script lang="ts">
	import DataTable from '$lib/components/coral/kit/data-table/data-table.svelte';
	import RelativeTime from '$lib/components/coral/kit/relative-time/relative-time.svelte';
	import { sortRows } from '$lib/components/coral/lib/table.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import type { Column, Sort } from '$lib/components/coral/kit/data-table/types.js';

	type Deploy = {
		id: string;
		project: string;
		author: string;
		status: 'ready' | 'building' | 'failed';
		duration: number | null;
		at: Date;
	};

	const minute = 60_000;
	const now = Date.now();

	const deploys: Deploy[] = [
		{
			id: '1',
			project: 'Açaí',
			author: 'Amara Diallo',
			status: 'ready',
			duration: 42,
			at: new Date(now - 3 * minute)
		},
		{
			id: '2',
			project: 'Kiwi',
			author: 'Wei Zhang',
			status: 'failed',
			duration: null,
			at: new Date(now - 26 * minute)
		},
		{
			id: '3',
			project: 'Mango',
			author: 'Sofia Rossi',
			status: 'building',
			duration: 9,
			at: new Date(now - 90 * minute)
		},
		{
			id: '4',
			project: 'Papaya',
			author: "Liam O'Connor",
			status: 'ready',
			duration: 128,
			at: new Date(now - 5 * 60 * minute)
		}
	];

	let sort = $state<Sort>({ column: 'at', direction: 'desc' });

	// Sorting is the caller's: the same table serves a page that sorts its own array and a server
	// that sorts for it.
	const rows = $derived(
		sortRows(deploys, sort, { value: (row, column) => row[column as keyof Deploy] })
	);

	const columns: Column<Deploy>[] = [
		{ id: 'project', header: 'Project', value: (row) => row.project, sortable: true },
		{ id: 'author', header: 'Author', value: (row) => row.author, sortable: true },
		{ id: 'status', header: 'Status', value: (row) => row.status, sortable: true, cell: status },
		{
			id: 'duration',
			header: 'Duration',
			value: (row) => row.duration,
			sortable: true,
			align: 'end',
			cell: duration
		},
		{ id: 'at', header: 'Deployed', value: (row) => row.at, sortable: true, cell: deployed }
	];
</script>

{#snippet status({ row }: { row: Deploy })}
	<Badge variant={row.status === 'failed' ? 'destructive' : 'secondary'}>{row.status}</Badge>
{/snippet}

{#snippet duration({ row }: { row: Deploy })}
	{row.duration === null ? '—' : `${row.duration}s`}
{/snippet}

{#snippet deployed({ row }: { row: Deploy })}
	<RelativeTime date={row.at} class="text-muted-foreground" />
{/snippet}

<div class="w-full max-w-3xl">
	<DataTable {rows} {columns} getRowId={(row) => row.id} bind:sort caption="Recent deploys" />
	<p class="mt-3 text-sm text-muted-foreground">
		Sorted by {sort?.column ?? 'nothing'}{sort ? `, ${sort.direction}` : ''}. A third press on the
		same header puts the rows back the way they arrived.
	</p>
</div>
