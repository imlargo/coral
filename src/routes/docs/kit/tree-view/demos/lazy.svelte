<script lang="ts">
	import { SvelteSet } from 'svelte/reactivity';
	import LoaderCircleIcon from '@lucide/svelte/icons/loader-circle';
	import TreeView from '$lib/coral/kit/tree-view/tree-view.svelte';
	import type { TreeNode } from '$lib/coral/kit/tree-view/types.js';

	let nodes = $state<TreeNode[]>([
		{ id: 'web-app', label: 'web-app', children: [] },
		{ id: 'api-gateway', label: 'api-gateway', children: [] },
		{ id: 'design-tokens', label: 'design-tokens', children: [] }
	]);
	const loaded = new SvelteSet<string>();
	let loading = $state<string[]>([]);

	// Fetches a repository's branches the first time it is opened.
	async function load(expanded: string[]) {
		for (const id of expanded) {
			if (loaded.has(id)) continue;
			loaded.add(id);
			loading = [...loading, id];
			await new Promise((resolve) => setTimeout(resolve, 700));
			nodes = nodes.map((node) =>
				node.id === id
					? {
							...node,
							children: ['main', 'develop', 'release/2.1'].map((name) => ({
								id: `${id}-${name}`,
								label: name
							}))
						}
					: node
			);
			loading = loading.filter((entry) => entry !== id);
		}
	}
</script>

<TreeView {nodes} label="Repositories" class="w-72" onexpandedchange={load}>
	{#snippet node({ node })}
		<span class="text-sm">{node.label}</span>
		{#if loading.includes(node.id)}
			<LoaderCircleIcon class="size-3.5 animate-spin" aria-label="Loading" />
		{/if}
	{/snippet}
</TreeView>
