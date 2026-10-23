<script lang="ts">
	import DataTable from '#lib/components/coral/kit/data-table/data-table.svelte';
	import PageState from '#lib/components/coral/kit/page-state/page-state.svelte';
	import { Button } from '#lib/components/ui/button/index.js';
	import type { Column } from '#lib/components/coral/kit/data-table/types.js';

	type Member = { id: string; name: string; role: string };

	const team: Member[] = [
		{ id: '1', name: 'Amara Diallo', role: 'Owner' },
		{ id: '2', name: 'Kenji Tanaka', role: 'Member' },
		{ id: '3', name: 'Elena van der Meer', role: 'Member' }
	];

	const columns: Column<Member>[] = [
		{ id: 'name', header: 'Name', value: (row) => row.name },
		{ id: 'role', header: 'Role', value: (row) => row.role }
	];

	let rows = $state<Member[]>([]);
	let loading = $state(false);

	async function load() {
		loading = true;
		await new Promise((resolve) => setTimeout(resolve, 1200));
		rows = team;
		loading = false;
	}
</script>

<div class="flex w-full max-w-xl flex-col gap-3">
	<Button variant="outline" size="sm" onclick={load}>Load the team</Button>

	<PageState
		{loading}
		empty={rows.length === 0}
		emptyTitle="Nobody here yet."
		emptyDescription="Invite someone to see them listed."
	>
		{#snippet loadingState()}
			<!-- A placeholder shaped like the thing it stands in for: the table's own skeleton rows,
			     so the header and the column widths are already right when the data lands. -->
			<DataTable rows={[]} {columns} getRowId={(row) => row.id} loading loadingRows={3} />
		{/snippet}

		<DataTable {rows} {columns} getRowId={(row) => row.id} caption="Team" />
	</PageState>
</div>
