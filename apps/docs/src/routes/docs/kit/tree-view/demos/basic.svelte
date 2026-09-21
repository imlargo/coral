<script lang="ts">
	import FileIcon from '@lucide/svelte/icons/file';
	import FolderIcon from '@lucide/svelte/icons/folder';
	import FolderOpenIcon from '@lucide/svelte/icons/folder-open';
	import TreeView from '$lib/components/coral/kit/tree-view/tree-view.svelte';
	import type { TreeNode } from '$lib/components/coral/kit/tree-view/types.js';

	const nodes: TreeNode[] = [
		{
			id: 'src',
			label: 'src',
			children: [
				{
					id: 'src-routes',
					label: 'routes',
					children: [
						{ id: 'src-routes-page', label: '+page.svelte' },
						{ id: 'src-routes-layout', label: '+layout.svelte' }
					]
				},
				{
					id: 'src-lib',
					label: 'lib',
					children: [{ id: 'src-lib-utils', label: 'utils.ts' }]
				}
			]
		},
		{
			id: 'tests',
			label: 'tests',
			children: [
				{ id: 'tests-utils', label: 'utils.test.ts' },
				{ id: 'tests-e2e', label: 'smoke.test.ts', disabled: true }
			]
		},
		{ id: 'readme', label: 'README.md' }
	];

	let expanded = $state(['src']);
	let selected = $state<string>();
</script>

<div class="flex w-72 flex-col gap-3">
	<TreeView
		{nodes}
		bind:expanded
		bind:selected
		label="Source tree"
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
