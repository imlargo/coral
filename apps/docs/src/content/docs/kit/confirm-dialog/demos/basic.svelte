<script lang="ts">
	import ConfirmDialog from '$lib/components/coral/kit/confirm-dialog/confirm-dialog.svelte';
	import { Button } from '$lib/components/ui/button/index.js';

	let revoked = $state(0);
</script>

<div class="flex flex-col items-center gap-3">
	<ConfirmDialog
		title="Revoke this API key?"
		description="Requests signed with it start failing immediately. You can issue a new one."
		confirmLabel="Revoke"
		cancelLabel="Cancel"
		variant="destructive"
		onconfirm={() => revoked++}
	>
		{#snippet trigger({ props })}
			<Button {...props} variant="outline">Revoke key</Button>
		{/snippet}
	</ConfirmDialog>

	<p class="text-sm text-muted-foreground">Revoked: {revoked}</p>
</div>
