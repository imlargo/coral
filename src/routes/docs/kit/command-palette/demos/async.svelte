<script lang="ts">
	import CommandPalette from '$lib/coral/kit/command-palette/command-palette.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import type { CommandAction } from '$lib/coral/kit/command-palette/types.js';

	let open = $state(false);
	let message = $state('');
	let attempts = 0;

	const actions: CommandAction[] = [
		{
			id: 'publish',
			label: 'Publicar cambios',
			description: 'Falla la primera vez',
			group: 'Despliegue',
			run: async () => {
				message = '';
				await new Promise((resolve) => setTimeout(resolve, 900));
				attempts++;
				if (attempts % 2 === 1) {
					message = 'El servidor rechazó la publicación. Intenta de nuevo.';
					// Exactly `false` keeps the palette open, con el mensaje a la vista.
					return false;
				}
				message = 'Publicado.';
			}
		},
		{
			id: 'rollback',
			label: 'Revertir al despliegue anterior',
			group: 'Despliegue',
			run: () => (message = 'Revertido.')
		}
	];
</script>

<div class="flex flex-col items-center gap-3">
	<Button variant="outline" onclick={() => (open = true)}>Abrir paleta</Button>

	<CommandPalette {actions} bind:open shortcut="" placeholder="Buscar…">
		{#snippet footer()}
			<div class="border-t px-3 py-2 text-xs text-muted-foreground">
				{message || 'Enter ejecuta la acción seleccionada.'}
			</div>
		{/snippet}
	</CommandPalette>

	<p class="text-sm text-muted-foreground" role="status">{message || '—'}</p>
</div>
