<script lang="ts">
	import ConfirmDialog from '#lib/components/coral/kit/confirm-dialog/confirm-dialog.svelte';
	import InlineEdit from '#lib/components/coral/kit/inline-edit/inline-edit.svelte';
	import { Button } from '#lib/components/ui/button/index.js';
	import { PROJECT, wait } from '#lib/features/home/world.js';
	import ShowcaseCard from './ShowcaseCard.svelte';

	let name = $state(PROJECT);
	let renameError = $state('');

	let deleteError = $state('');
	let attempts = 0;
	let deleted = $state(false);

	async function rename(next: string) {
		renameError = '';
		await wait(600);
		if (/\s/.test(next)) throw new Error('Project names cannot contain spaces.');
	}

	// The first attempt fails, the second goes through: the dialog has to survive a failed request.
	async function remove() {
		deleteError = '';
		attempts++;
		await wait(900);
		if (attempts === 1) throw new Error(`${name} has a deployment in progress.`);
		deleted = true;
	}

	function restore() {
		deleted = false;
		attempts = 0;
	}
</script>

<ShowcaseCard
	title="Project"
	description="Rename it in place, or delete it for good."
	hint="Rename it to `web app`: the save is refused and keeps what you typed. Deleting fails once, then goes through."
	components={['kit/inline-edit', 'kit/confirm-dialog']}
>
	{#if deleted}
		<div class="flex flex-wrap items-center justify-between gap-2">
			<p class="text-sm text-muted-foreground" role="status">{name} was deleted.</p>
			<Button variant="outline" size="sm" onclick={restore}>Restore</Button>
		</div>
	{:else}
		<div class="grid gap-1">
			<span class="text-xs text-muted-foreground">Name</span>
			<InlineEdit
				bind:value={name}
				class="w-full"
				required
				editLabel={(current) => `Rename project ${current}`}
				onsave={rename}
				onerror={(error) => (renameError = (error as Error).message)}
				oncancel={() => (renameError = '')}
			/>
			{#if renameError}
				<p class="text-xs text-destructive" role="alert">{renameError}</p>
			{/if}
		</div>

		<div class="flex flex-wrap items-center justify-between gap-2">
			<p class="text-sm text-muted-foreground">Deletes every deployment and environment.</p>
			<ConfirmDialog
				title="Delete {name}?"
				description="Its deployments, environments and API keys are removed. This cannot be undone."
				confirmLabel="Delete project"
				cancelLabel="Cancel"
				variant="destructive"
				onconfirm={remove}
				onerror={(error) => (deleteError = (error as Error).message)}
				oncancel={() => (deleteError = '')}
			>
				{#snippet trigger({ props })}
					<Button {...props} variant="destructive" size="sm">Delete project</Button>
				{/snippet}
				{#if deleteError}
					<p class="text-sm text-destructive" role="alert">{deleteError} Try again.</p>
				{/if}
			</ConfirmDialog>
		</div>
	{/if}
</ShowcaseCard>
