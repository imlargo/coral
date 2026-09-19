<script lang="ts">
	import FileIcon from '@lucide/svelte/icons/file';
	import FolderIcon from '@lucide/svelte/icons/folder';
	import FolderOpenIcon from '@lucide/svelte/icons/folder-open';
	import TreeView from '$lib/coral/kit/tree-view/tree-view.svelte';
	import type { TreeNode } from '$lib/coral/kit/tree-view/types.js';

	const nodes: TreeNode[] = [
		{
			id: 'contracts',
			label: 'Contracts',
			children: [
				{
					id: 'contracts-2026',
					label: '2026',
					children: [
						{ id: 'c-001', label: 'North Site.pdf' },
						{ id: 'c-002', label: 'Inspection Report.pdf' }
					]
				},
				{
					id: 'contracts-2025',
					label: '2025',
					children: [{ id: 'c-003', label: 'Supplies.pdf' }]
				}
			]
		},
		{
			id: 'minutes',
			label: 'Minutes',
			children: [
				{ id: 'm-001', label: 'Kickoff minutes.docx' },
				{ id: 'm-002', label: 'Progress minutes.docx', disabled: true }
			]
		},
		{ id: 'readme', label: 'ReadMe.txt' }
	];

	let expanded = $state(['contracts']);
	let selected = $state<string>();
</script>

<div class="flex w-72 flex-col gap-3">
	<TreeView
		{nodes}
		bind:expanded
		bind:selected
		label="Documents"
		rowClass="rounded-md px-1 py-0.5 data-selected:bg-muted"
	>
		{#snippet node({ node, expandable, expanded })}
			{#if expandable}
				{#if expanded}<FolderOpenIcon class="size-4 shrink-0" />{:else}<FolderIcon
						class="size-4 shrink-0"
					/>{/if}
			{:else}
				<FileIcon class="size-4 shrink-0" />
			{/if}
			<span class="min-w-0 truncate text-sm">{node.label}</span>
		{/snippet}
	</TreeView>
	<p class="text-sm text-muted-foreground">Selected: {selected ?? '—'}</p>
</div>
