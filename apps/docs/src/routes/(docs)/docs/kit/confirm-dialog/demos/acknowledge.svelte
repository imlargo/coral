<script lang="ts">
	import ConfirmDialog from '$lib/components/coral/kit/confirm-dialog/confirm-dialog.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
</script>

<ConfirmDialog
	title="Permissions updated"
	description="Your role on this project changed. Some sections may look different."
	confirmLabel="Got it"
	showCancel={false}
>
	{#snippet trigger({ props })}
		<Button {...props} variant="outline">View notice</Button>
	{/snippet}
</ConfirmDialog>
