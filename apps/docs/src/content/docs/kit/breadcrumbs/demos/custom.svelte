<script lang="ts">
	import FolderGit2Icon from '@lucide/svelte/icons/folder-git-2';
	import SlashIcon from '@lucide/svelte/icons/slash';
	import Breadcrumbs from '#lib/components/coral/kit/breadcrumbs/breadcrumbs.svelte';
	import type { Crumb } from '#lib/components/coral/kit/breadcrumbs/types.js';

	const trail: Crumb[] = [
		{ label: 'imlargo', href: '#' },
		{ label: 'coral', href: '#' },
		{ label: 'packages', href: '#' },
		{ label: 'coral.json' }
	];
</script>

<Breadcrumbs items={trail} class="w-full">
	{#snippet item({ crumb, index })}
		{#if index === 1}
			<FolderGit2Icon class="size-3.5" aria-hidden="true" />
		{/if}
		{crumb.label}
	{/snippet}
	{#snippet separator()}
		<SlashIcon />
	{/snippet}
</Breadcrumbs>
