<script lang="ts">
	import GripVerticalIcon from '@lucide/svelte/icons/grip-vertical';
	import ReorderList from '$lib/components/coral/kit/reorder-list/reorder-list.svelte';
	import { Badge } from '$lib/components/ui/badge/index.js';

	type Task = { id: number; title: string; owner: string };

	let tasks = $state<Task[]>([
		{ id: 1, title: 'Cut the release branch', owner: 'Amara' },
		{ id: 2, title: 'Run the migration', owner: 'Wei' },
		{ id: 3, title: 'Deploy to staging', owner: 'Sofia' },
		{ id: 4, title: 'Promote to production', owner: 'Liam' }
	]);
</script>

<ReorderList
	bind:items={tasks}
	class="w-80"
	aria-label="Release steps"
	getKey={(task) => task.id}
	getLabel={(task) => task.title}
>
	{#snippet row({ item, index, handle, dragging })}
		<div
			class="flex w-full items-center gap-3 rounded-md border bg-background px-2 py-2 text-sm"
			data-dragging={dragging || undefined}
		>
			<span {...handle} class="cursor-grab rounded-sm outline-offset-2 focus-visible:outline-2">
				<GripVerticalIcon class="size-4" aria-hidden="true" />
			</span>
			<span class="w-4 text-muted-foreground">{index + 1}</span>
			<span class="flex-1">{item.title}</span>
			<Badge variant="secondary">{item.owner}</Badge>
		</div>
	{/snippet}
</ReorderList>
