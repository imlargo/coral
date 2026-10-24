<script lang="ts">
	import PencilIcon from '@lucide/svelte/icons/pencil';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import Trash2Icon from '@lucide/svelte/icons/trash-2';
	import TreeView from '#lib/components/coral/kit/tree-view/tree-view.svelte';
	import { Button } from '#lib/components/ui/button/index.js';
	import type { TreeNode } from '#lib/components/coral/kit/tree-view/types.js';

	const nodes: TreeNode[] = [
		{
			id: 'environments',
			label: 'Environments',
			children: [
				{ id: 'production', label: 'production' },
				{ id: 'staging', label: 'staging' },
				{ id: 'preview', label: 'preview' }
			]
		},
		{
			id: 'secrets',
			label: 'Secrets',
			children: [
				{ id: 'database-url', label: 'DATABASE_URL' },
				{ id: 'api-key', label: 'API_KEY' }
			]
		}
	];

	let last = $state('');
</script>

<div class="flex w-80 flex-col gap-3">
	<!-- `group` on the row lets the actions show on hover and on focus within the row. -->
	<TreeView
		{nodes}
		expanded={['environments', 'secrets']}
		label="Project settings"
		rowClass="group rounded-md px-1 py-0.5 data-selected:bg-muted"
	>
		{#snippet actions({ node, expandable })}
			<span class="flex opacity-0 group-focus-within:opacity-100 group-hover:opacity-100">
				{#if expandable}
					<Button
						variant="ghost"
						size="icon-xs"
						aria-label="Add to {node.label}"
						onclick={() => (last = `Add to ${node.label}`)}
					>
						<PlusIcon />
					</Button>
				{:else}
					<Button
						variant="ghost"
						size="icon-xs"
						aria-label="Rename {node.label}"
						onclick={() => (last = `Rename ${node.label}`)}
					>
						<PencilIcon />
					</Button>
					<Button
						variant="ghost"
						size="icon-xs"
						aria-label="Delete {node.label}"
						onclick={() => (last = `Delete ${node.label}`)}
					>
						<Trash2Icon />
					</Button>
				{/if}
			</span>
		{/snippet}
	</TreeView>
	<p class="text-sm text-muted-foreground">
		{last || 'Focus a row and press Tab to reach its actions.'}
	</p>
</div>
