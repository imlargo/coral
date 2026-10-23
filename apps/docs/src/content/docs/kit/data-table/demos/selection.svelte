<script lang="ts">
	import Trash2Icon from '@lucide/svelte/icons/trash-2';
	import ConfirmDialog from '$lib/components/coral/kit/confirm-dialog/confirm-dialog.svelte';
	import DataTable from '$lib/components/coral/kit/data-table/data-table.svelte';
	import SearchInput from '$lib/components/coral/kit/search-input/search-input.svelte';
	import { filterRows } from '$lib/components/coral/lib/table.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import type { Column } from '$lib/components/coral/kit/data-table/types.js';

	type Key = { id: string; label: string; project: string; scope: string; owner: string };

	let keys = $state<Key[]>([
		{ id: '1', label: 'CI pipeline', project: 'Açaí', scope: 'deploy', owner: 'Amara Diallo' },
		{ id: '2', label: 'Staging seed', project: 'Kiwi', scope: 'read', owner: 'Wei Zhang' },
		{ id: '3', label: 'Metrics export', project: 'Mango', scope: 'read', owner: 'Priya Sharma' },
		{ id: '4', label: 'Webhook relay', project: 'Papaya', scope: 'write', owner: 'Kenji Tanaka' }
	]);

	let term = $state('');
	let selected = $state<string[]>([]);

	const rows = $derived(
		filterRows(keys, term, (row) => [row.label, row.project, row.scope, row.owner])
	);

	const columns: Column<Key>[] = [
		{ id: 'label', header: 'Key', value: (row) => row.label },
		{ id: 'project', header: 'Project', value: (row) => row.project },
		{ id: 'scope', header: 'Scope', value: (row) => row.scope },
		{ id: 'owner', header: 'Owner', value: (row) => row.owner }
	];

	function revoke() {
		keys = keys.filter((key) => !selected.includes(key.id));
		selected = [];
	}
</script>

<div class="flex w-full max-w-3xl flex-col gap-3">
	<div class="flex items-center justify-between gap-3">
		<SearchInput
			bind:value={term}
			onsearch={(next) => (term = next)}
			placeholder="Search keys"
			aria-label="Search keys"
			class="max-w-64"
		/>

		{#if selected.length > 0}
			<ConfirmDialog
				title="Revoke {selected.length} key{selected.length === 1 ? '' : 's'}?"
				description="Anything still using them will start failing immediately."
				confirmLabel="Revoke"
				variant="destructive"
				onconfirm={revoke}
			>
				{#snippet trigger({ props })}
					<Button {...props} variant="outline" size="sm">
						<Trash2Icon data-icon="inline-start" />
						Revoke ({selected.length})
					</Button>
				{/snippet}
			</ConfirmDialog>
		{/if}
	</div>

	<DataTable
		{rows}
		{columns}
		getRowId={(row) => row.id}
		selection="multiple"
		bind:selected
		caption="API keys"
		emptyMessage="No key matches that search."
		selectRowLabel={(row) => `Select ${row.label}`}
	/>

	<p class="text-sm text-muted-foreground">
		Shift-click a second row to take the range. Search matches every word against the whole row and
		folds accents, so <code>acai</code> finds Açaí - the same rule the combobox uses.
	</p>
</div>
