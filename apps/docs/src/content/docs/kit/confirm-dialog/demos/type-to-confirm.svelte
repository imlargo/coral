<script lang="ts">
	import ConfirmDialog from '#lib/components/coral/kit/confirm-dialog/confirm-dialog.svelte';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Input } from '#lib/components/ui/input/index.js';
	import { Label } from '#lib/components/ui/label/index.js';

	const project = 'api-gateway';

	let open = $state(false);
	let typed = $state('');
	let deleted = $state(false);

	// The body resets with the dialog, so the next open does not start half-confirmed.
	$effect(() => {
		if (!open) typed = '';
	});
</script>

<div class="flex flex-col items-center gap-3">
	<ConfirmDialog
		bind:open
		title="Delete {project}?"
		description="Every deployment and environment in it goes with it. This cannot be undone."
		confirmLabel="Delete project"
		variant="destructive"
		confirmDisabled={typed !== project}
		onconfirm={() => (deleted = true)}
	>
		{#snippet trigger({ props })}
			<Button {...props} variant="outline" disabled={deleted}>Delete the project</Button>
		{/snippet}

		<div class="flex flex-col gap-2">
			<Label for="confirm-name">Type <strong>{project}</strong> to confirm</Label>
			<Input id="confirm-name" bind:value={typed} autocomplete="off" />
		</div>
	</ConfirmDialog>

	<p class="text-sm text-muted-foreground">{deleted ? 'Deleted.' : 'Nothing deleted yet.'}</p>
</div>
