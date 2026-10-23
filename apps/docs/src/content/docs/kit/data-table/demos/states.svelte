<script lang="ts">
	import DataTable from '$lib/components/coral/kit/data-table/data-table.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import type { Column } from '$lib/components/coral/kit/data-table/types.js';

	type Invite = { id: string; email: string; role: string };

	const invites: Invite[] = [
		{ id: '1', email: 'elena@example.com', role: 'Admin' },
		{ id: '2', email: 'lucas@example.com', role: 'Member' }
	];

	const columns: Column<Invite>[] = [
		{ id: 'email', header: 'Email', value: (row) => row.email },
		{ id: 'role', header: 'Role', value: (row) => row.role }
	];

	let rows = $state<Invite[]>([]);
	let loading = $state(false);

	async function load() {
		loading = true;
		rows = [];
		await new Promise((resolve) => setTimeout(resolve, 1200));
		rows = invites;
		loading = false;
	}
</script>

<div class="flex w-full max-w-2xl flex-col gap-3">
	<div class="flex gap-2">
		<Button variant="outline" size="sm" onclick={load}>Load</Button>
		<Button variant="outline" size="sm" onclick={() => (rows = [])} disabled={loading}>
			Clear
		</Button>
	</div>

	<DataTable
		{rows}
		{columns}
		{loading}
		loadingRows={2}
		getRowId={(row) => row.id}
		caption="Pending invites"
		emptyMessage="No pending invites."
	/>
</div>
