<script lang="ts">
	import FileIcon from '@lucide/svelte/icons/file';
	import FolderIcon from '@lucide/svelte/icons/folder';
	import FolderOpenIcon from '@lucide/svelte/icons/folder-open';
	import TreeView from '#lib/components/coral/kit/tree-view/tree-view.svelte';
	import type { TreeNode } from '#lib/components/coral/kit/tree-view/types.js';
	import ShowcaseCard from '#lib/features/home/showcase/ShowcaseCard.svelte';
	import { PROJECT } from '#lib/features/home/world.js';

	// Ids are paths, so the selection prints as one.
	const nodes: TreeNode[] = [
		{
			id: 'src',
			label: 'src',
			children: [
				{
					id: 'src/routes',
					label: 'routes',
					children: [
						{ id: 'src/routes/+layout.svelte', label: '+layout.svelte' },
						{ id: 'src/routes/+page.svelte', label: '+page.svelte' },
						{
							id: 'src/routes/deployments',
							label: 'deployments',
							children: [
								{ id: 'src/routes/deployments/+page.svelte', label: '+page.svelte' },
								{ id: 'src/routes/deployments/+page.ts', label: '+page.ts' }
							]
						}
					]
				},
				{
					id: 'src/lib',
					label: 'lib',
					children: [
						{ id: 'src/lib/api.ts', label: 'api.ts' },
						{ id: 'src/lib/webhooks.ts', label: 'webhooks.ts' }
					]
				},
				{ id: 'src/app.html', label: 'app.html' }
			]
		},
		{
			id: 'static',
			label: 'static',
			children: [{ id: 'static/favicon.png', label: 'favicon.png' }]
		},
		{ id: 'package.json', label: 'package.json' },
		{ id: 'svelte.config.js', label: 'svelte.config.js' },
		{ id: 'README.md', label: 'README.md' }
	];

	let expanded = $state(['src', 'src/routes']);
	let selected = $state<string>();
</script>

<ShowcaseCard
	title="Repository"
	description="Browse the files of {PROJECT} on main."
	hint="Click a row, then use the arrow keys, or type a letter: “p” jumps to package.json."
	components={['kit/tree-view']}
>
	<div class="flex min-w-0 flex-col gap-3">
		<TreeView
			{nodes}
			bind:expanded
			bind:selected
			label="Files in {PROJECT}"
			rowClass="rounded-md px-1 py-0.5 data-selected:bg-muted"
		>
			{#snippet node({ node, expandable, expanded })}
				{#if expandable && expanded}
					<FolderOpenIcon class="size-4 shrink-0" aria-hidden="true" />
				{:else if expandable}
					<FolderIcon class="size-4 shrink-0" aria-hidden="true" />
				{:else}
					<FileIcon class="size-4 shrink-0" aria-hidden="true" />
				{/if}
				<span class="min-w-0 truncate text-sm">{node.label}</span>
			{/snippet}
		</TreeView>
		<p class="min-w-0 truncate text-sm text-muted-foreground">
			{selected ? `Selected: ${selected}` : 'No file selected'}
		</p>
	</div>
</ShowcaseCard>
