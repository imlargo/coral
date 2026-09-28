<script lang="ts">
	import Trash2Icon from '@lucide/svelte/icons/trash-2';
	import TablePanel from '$lib/components/coral/blocks/table-panel/table-panel.svelte';
	import ConfirmDialog from '$lib/components/coral/kit/confirm-dialog/confirm-dialog.svelte';
	import RelativeTime from '$lib/components/coral/kit/relative-time/relative-time.svelte';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import type { Column } from '$lib/components/coral/kit/data-table/types.js';

	type Run = {
		id: string;
		workflow: string;
		project: string;
		status: 'passed' | 'failed' | 'running';
		author: string;
		at: Date;
	};

	const minute = 60_000;
	const projects = ['Açaí', 'Guava', 'Kiwi', 'Mango', 'Papaya', 'Lychee'];
	const people = ['Amara Diallo', 'Wei Zhang', 'Sofia Rossi', "Liam O'Connor", 'Priya Sharma'];
	const workflows = ['build', 'test', 'deploy', 'lint'];

	let runs = $state<Run[]>(
		Array.from({ length: 23 }, (_, index) => ({
			id: String(index + 1),
			workflow: workflows[index % workflows.length],
			project: projects[index % projects.length],
			status: (['passed', 'failed', 'running'] as const)[index % 3],
			author: people[index % people.length],
			at: new Date(Date.now() - (index + 1) * 7 * minute)
		}))
	);

	let selected = $state<string[]>([]);

	const columns: Column<Run>[] = [
		{ id: 'workflow', header: 'Workflow', value: (row) => row.workflow, sortable: true },
		{ id: 'project', header: 'Project', value: (row) => row.project, sortable: true },
		{ id: 'status', header: 'Status', value: (row) => row.status, sortable: true, cell: status },
		{ id: 'author', header: 'Triggered by', value: (row) => row.author, sortable: true },
		{ id: 'at', header: 'Started', value: (row) => row.at, sortable: true, cell: started }
	];

	function cancel(ids: string[]) {
		runs = runs.filter((run) => !ids.includes(run.id));
		selected = [];
	}
</script>

{#snippet status({ row }: { row: Run })}
	<Badge variant={row.status === 'failed' ? 'destructive' : 'secondary'}>{row.status}</Badge>
{/snippet}

{#snippet started({ row }: { row: Run })}
	<RelativeTime date={row.at} class="text-muted-foreground" />
{/snippet}

<div class="w-full max-w-4xl">
	<TablePanel
		rows={runs}
		{columns}
		getRowId={(row) => row.id}
		bind:selected
		selection="multiple"
		searchPlaceholder="Search runs"
		caption="Workflow runs"
		emptyTitle="No runs yet."
		emptyDescription="Push to a branch and the workflow runs here."
		noResultsTitle="No runs match that search."
	>
		{#snippet bulk({ ids })}
			<ConfirmDialog
				title="Cancel {ids.length} run{ids.length === 1 ? '' : 's'}?"
				description="They stop where they are. Anything already deployed stays deployed."
				confirmLabel="Cancel runs"
				variant="destructive"
				onconfirm={() => cancel(ids)}
			>
				{#snippet trigger({ props })}
					<Button {...props} variant="outline" size="sm">
						<Trash2Icon data-icon="inline-start" />
						Cancel
					</Button>
				{/snippet}
			</ConfirmDialog>
		{/snippet}
	</TablePanel>
</div>
