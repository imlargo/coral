<script lang="ts">
	import ConfirmDialog from '$lib/coral/kit/confirm-dialog/confirm-dialog.svelte';
	import { Button } from '$lib/components/ui/button/index.js';

	const affected = ['Contract 2024-118', 'Contract 2024-204', 'Contract 2025-011'];
</script>

<ConfirmDialog
	title="Close 3 contracts?"
	description="This action cannot be undone."
	confirmLabel="Close contracts"
	cancelLabel="Cancel"
	variant="destructive"
>
	{#snippet trigger({ props })}
		<Button {...props} variant="outline">Close selected</Button>
	{/snippet}

	<!-- Anything between the description and the buttons: what exactly is affected. -->
	<ul class="list-inside list-disc text-sm text-muted-foreground">
		{#each affected as item (item)}
			<li>{item}</li>
		{/each}
	</ul>
</ConfirmDialog>
