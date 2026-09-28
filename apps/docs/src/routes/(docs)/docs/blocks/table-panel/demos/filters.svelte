<script lang="ts">
	import TablePanel from '$lib/components/coral/blocks/table-panel/table-panel.svelte';
	import Select from '$lib/components/coral/kit/select/select.svelte';
	import type { Column } from '$lib/components/coral/kit/data-table/types.js';

	type Key = { id: string; label: string; scope: 'read' | 'write' | 'deploy'; owner: string };

	const owners = ['Kenji Tanaka', 'Elena van der Meer', 'Lucas Andersen'];
	const scopes = ['read', 'write', 'deploy'] as const;

	const keys: Key[] = Array.from({ length: 14 }, (_, index) => ({
		id: String(index + 1),
		label: `${['CI', 'Staging', 'Metrics', 'Webhook'][index % 4]} key ${index + 1}`,
		scope: scopes[index % 3],
		owner: owners[index % 3]
	}));

	let scope = $state<'all' | Key['scope']>('all');

	// A filter the panel does not own: it narrows the rows going in, and the panel searches, sorts
	// and pages whatever it is handed.
	const rows = $derived(scope === 'all' ? keys : keys.filter((key) => key.scope === scope));

	const columns: Column<Key>[] = [
		{ id: 'label', header: 'Key', value: (row) => row.label, sortable: true },
		{ id: 'scope', header: 'Scope', value: (row) => row.scope, sortable: true },
		{ id: 'owner', header: 'Owner', value: (row) => row.owner, sortable: true }
	];
</script>

<div class="w-full max-w-3xl">
	<TablePanel
		{rows}
		{columns}
		getRowId={(row) => row.id}
		pageSize={5}
		pageSizes={[5, 10]}
		searchPlaceholder="Search keys"
		caption="API keys"
		noResultsTitle="No key matches that."
	>
		{#snippet toolbar()}
			<Select
				options={[
					{ value: 'all', label: 'Every scope' },
					{ value: 'read', label: 'Read' },
					{ value: 'write', label: 'Write' },
					{ value: 'deploy', label: 'Deploy' }
				]}
				bind:value={scope}
				size="sm"
				class="w-40"
			/>
		{/snippet}
	</TablePanel>
</div>
