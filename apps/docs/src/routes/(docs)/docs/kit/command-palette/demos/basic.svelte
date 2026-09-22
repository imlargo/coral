<script lang="ts">
	import FilePlusIcon from '@lucide/svelte/icons/file-plus';
	import SearchIcon from '@lucide/svelte/icons/search';
	import CommandPalette from '$lib/components/coral/kit/command-palette/command-palette.svelte';
	import Shortcut from '$lib/components/coral/kit/shortcut/shortcut.svelte';
	import type { CommandAction } from '$lib/components/coral/kit/command-palette/types.js';

	let recent = $state<string[]>([]);
	let last = $state('');

	const actions: CommandAction[] = [
		{
			id: 'new-project',
			label: 'New project',
			description: 'Start from a template',
			group: 'Create',
			shortcut: 'alt+n',
			keywords: ['scaffold', 'repository'],
			run: () => (last = 'New project')
		},
		{
			id: 'import',
			label: 'Import from CSV',
			group: 'Create',
			keywords: ['spreadsheet', 'upload'],
			run: () => (last = 'Import from CSV')
		},
		{
			id: 'members',
			label: 'Invite a teammate',
			group: 'Team',
			run: () => (last = 'Invite a teammate')
		},
		{
			id: 'billing',
			label: 'Billing',
			description: 'Requires admin permissions',
			group: 'Account',
			disabled: true,
			run: () => {}
		},
		{ id: 'theme', label: 'Toggle theme', group: 'Account', run: () => (last = 'Toggle theme') }
	];
</script>

<div class="flex flex-col items-center gap-3">
	<CommandPalette
		{actions}
		bind:recent
		shortcut="alt+k"
		placeholder="Type a command…"
		emptyMessage="Nothing matches that."
		recentLabel="Recent"
	>
		{#snippet trigger({ props })}
			<button
				{...props}
				class="flex h-8 w-64 items-center gap-2 rounded-md border px-2.5 text-sm text-muted-foreground"
			>
				<SearchIcon class="size-4 shrink-0" />
				<span>Search actions…</span>
				<Shortcut keys="alt+k" class="ms-auto" />
			</button>
		{/snippet}

		{#snippet action({ action })}
			{#if action.group === 'Create'}<FilePlusIcon />{/if}
			<span class="flex min-w-0 flex-col">
				<span class="truncate">{action.label}</span>
				{#if action.description}
					<span class="truncate text-xs text-muted-foreground">{action.description}</span>
				{/if}
			</span>
			{#if action.shortcut}
				<Shortcut keys={action.shortcut} class="ms-auto" />
			{/if}
		{/snippet}
	</CommandPalette>

	<p class="text-sm text-muted-foreground">
		Last action: {last || '—'} · recent: {recent.length}
	</p>
</div>
