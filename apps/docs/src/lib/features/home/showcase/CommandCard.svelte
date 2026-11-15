<script lang="ts">
	import CommandIcon from '@lucide/svelte/icons/command';
	import CommandPalette from '#lib/components/coral/kit/command-palette/command-palette.svelte';
	import Shortcut from '#lib/components/coral/kit/shortcut/shortcut.svelte';
	import type { CommandAction } from '#lib/components/coral/kit/command-palette/types.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import { PROJECT, REPOSITORIES, wait } from '#lib/features/home/world.js';
	import ShowcaseCard from './ShowcaseCard.svelte';

	// Not `mod+k`: the site's own search already answers to it, and two global listeners on one
	// combo would both toggle.
	const SHORTCUT = 'mod+j';

	let recent = $state<string[]>([]);
	let last = $state('');
	let failure = $state('');
	let deploys = 0;

	const actions: CommandAction[] = [
		{
			id: 'deploy',
			label: `Deploy ${PROJECT} to production`,
			description: 'From main, after the checks pass',
			group: 'Deploy',
			keywords: ['ship', 'release'],
			run: async () => {
				failure = '';
				await wait(900);
				deploys++;
				if (deploys === 1) throw new Error('The health check on build 214 failed. Run it again.');
			}
		},
		{
			id: 'rollback',
			label: 'Roll back last deploy',
			description: 'Restores the previous production build',
			group: 'Deploy',
			keywords: ['revert', 'undo'],
			run: () => wait(600)
		},
		{
			id: 'invite',
			label: 'Invite a teammate',
			group: 'Team',
			keywords: ['member', 'add'],
			run: () => {}
		},
		{
			id: 'settings',
			label: 'Open project settings',
			group: 'Project',
			keywords: ['preferences', 'environment variables'],
			run: () => {}
		},
		{
			id: 'delete',
			label: `Delete ${PROJECT}`,
			description: 'Only the owner can delete a project',
			group: 'Project',
			disabled: true,
			run: () => {}
		},
		...REPOSITORIES.filter((repository) => repository !== PROJECT).map((repository) => ({
			id: `repository-${repository}`,
			label: `Switch to repository ${repository}`,
			group: 'Repositories',
			run: () => {}
		}))
	];
</script>

<ShowcaseCard
	title="Command palette"
	description={`Every action in ${PROJECT}, one search away.`}
	hint="Press Ctrl+J (Cmd+J on a Mac) or the button. The deploy fails the first time and the palette stays open to say so."
	components={['kit/command-palette', 'kit/shortcut']}
>
	<CommandPalette
		{actions}
		bind:recent
		shortcut={SHORTCUT}
		title="Command palette"
		description={`Search actions in ${PROJECT}`}
		placeholder="Search actions..."
		emptyMessage="No action matches that."
		onrun={(action) => (last = action.label)}
		onerror={(error) => (failure = (error as Error).message)}
		onOpenChangeComplete={(open) => {
			if (!open) failure = '';
		}}
	>
		{#snippet trigger({ props })}
			<Button {...props} variant="outline" class="w-full justify-between">
				<span class="flex min-w-0 items-center gap-2">
					<CommandIcon aria-hidden="true" />
					<span class="truncate">Run a command</span>
				</span>
				<Shortcut keys={SHORTCUT} />
			</Button>
		{/snippet}

		{#snippet footer()}
			<p class="border-t px-3 py-2 text-xs text-muted-foreground" role="status">
				{failure || 'Enter runs the highlighted action.'}
			</p>
		{/snippet}
	</CommandPalette>

	<p class="text-sm text-muted-foreground" aria-live="polite">
		{#if last}
			Last run: <span class="font-medium text-foreground">{last}</span>
		{:else}
			Nothing run yet.
		{/if}
	</p>
</ShowcaseCard>
