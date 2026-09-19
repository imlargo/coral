<script lang="ts">
	import ConfirmDialog from '$lib/coral/kit/confirm-dialog/confirm-dialog.svelte';
	import { Button } from '$lib/components/ui/button/index.js';

	let removed = $state(0);
</script>

<div class="flex flex-col items-center gap-3">
	<ConfirmDialog
		title="Disable this workspace?"
		description="Its history is kept, and you can reactivate it anytime."
		confirmLabel="Disable"
		cancelLabel="Cancel"
		variant="destructive"
		onconfirm={() => removed++}
	>
		{#snippet trigger({ props })}
			<Button {...props} variant="outline">Disable workspace</Button>
		{/snippet}
	</ConfirmDialog>

	<p class="text-sm text-muted-foreground">Disabled: {removed}</p>
</div>
