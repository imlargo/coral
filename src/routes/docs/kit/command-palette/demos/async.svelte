<script lang="ts">
	import CommandPalette from '$lib/coral/kit/command-palette/command-palette.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import type { CommandAction } from '$lib/coral/kit/command-palette/types.js';

	let open = $state(false);
	let message = $state('');
	let attempts = 0;

	const actions: CommandAction[] = [
		{
			id: 'deploy',
			label: 'Deploy to production',
			description: 'Fails the first time',
			group: 'Deploy',
			run: async () => {
				message = '';
				await new Promise((resolve) => setTimeout(resolve, 900));
				attempts++;
				if (attempts % 2 === 1) {
					message = 'The build server refused the deploy. Try again.';
					// Exactly `false` keeps the palette open, with the message still on screen.
					return false;
				}
				message = 'Deployed.';
			}
		},
		{
			id: 'rollback',
			label: 'Roll back to the previous deployment',
			group: 'Deploy',
			run: () => (message = 'Rolled back.')
		}
	];
</script>

<div class="flex flex-col items-center gap-3">
	<Button variant="outline" onclick={() => (open = true)}>Open the palette</Button>

	<CommandPalette {actions} bind:open shortcut="" placeholder="Search…">
		{#snippet footer()}
			<div class="border-t px-3 py-2 text-xs text-muted-foreground">
				{message || 'Enter runs the selected action.'}
			</div>
		{/snippet}
	</CommandPalette>

	<p class="text-sm text-muted-foreground" role="status">{message || '—'}</p>
</div>
