<script lang="ts">
	import ConfirmDialog from '$lib/coral/kit/confirm-dialog/confirm-dialog.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
</script>

<ConfirmDialog
	title="Session updated"
	description="Your permissions changed. Some sections may look different."
	confirmLabel="Got it"
	showCancel={false}
>
	{#snippet trigger({ props })}
		<Button {...props} variant="outline">View notice</Button>
	{/snippet}
</ConfirmDialog>
