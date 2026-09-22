<script lang="ts">
	import ConfirmDialog from '$lib/components/coral/kit/confirm-dialog/confirm-dialog.svelte';
	import { Button } from '$lib/components/ui/button/index.js';

	const affected = [
		'#412 Flaky test on CI',
		'#418 Webhook retries never stop',
		'#423 Stale cache after deploy'
	];
</script>

<ConfirmDialog
	title="Close 3 issues?"
	description="This action cannot be undone."
	confirmLabel="Close issues"
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
