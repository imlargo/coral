<script lang="ts">
	import FilePlusIcon from '@lucide/svelte/icons/file-plus';
	import SearchIcon from '@lucide/svelte/icons/search';
	import CommandPalette from '$lib/coral/kit/command-palette/command-palette.svelte';
	import Shortcut from '$lib/coral/kit/shortcut/shortcut.svelte';
	import type { CommandAction } from '$lib/coral/kit/command-palette/types.js';

	let recent = $state<string[]>([]);
	let last = $state('');

	const actions: CommandAction[] = [
		{
			id: 'new-project',
			label: 'Nuevo proyecto',
			description: 'Empieza desde cero',
			group: 'Crear',
			shortcut: 'alt+n',
			keywords: ['crear', 'obra'],
			run: () => (last = 'Nuevo proyecto')
		},
		{
			id: 'import',
			label: 'Importar desde CSV',
			group: 'Crear',
			keywords: ['excel', 'planilla'],
			run: () => (last = 'Importar desde CSV')
		},
		{ id: 'members', label: 'Invitar a alguien', group: 'Equipo', run: () => (last = 'Invitar') },
		{
			id: 'billing',
			label: 'Facturación',
			description: 'Requiere permisos de administrador',
			group: 'Cuenta',
			disabled: true,
			run: () => {}
		},
		{ id: 'theme', label: 'Cambiar tema', group: 'Cuenta', run: () => (last = 'Cambiar tema') }
	];
</script>

<div class="flex flex-col items-center gap-3">
	<CommandPalette
		{actions}
		bind:recent
		shortcut="alt+k"
		placeholder="Escribe una acción…"
		emptyMessage="Nada coincide con eso."
		recentLabel="Recientes"
	>
		{#snippet trigger({ props })}
			<button
				{...props}
				class="flex h-8 w-64 items-center gap-2 rounded-md border px-2.5 text-sm text-muted-foreground"
			>
				<SearchIcon class="size-4 shrink-0" />
				<span>Buscar acción…</span>
				<Shortcut keys="alt+k" class="ms-auto" />
			</button>
		{/snippet}

		{#snippet action({ action })}
			{#if action.group === 'Crear'}<FilePlusIcon />{/if}
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
		Última acción: {last || '—'} · recientes: {recent.length}
	</p>
</div>
