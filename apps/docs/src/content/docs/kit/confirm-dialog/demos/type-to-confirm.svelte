<script lang="ts">
	import ConfirmDialog from '#lib/components/coral/kit/confirm-dialog/confirm-dialog.svelte';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Input } from '#lib/components/ui/input/index.js';
	import { Label } from '#lib/components/ui/label/index.js';

	const project = 'billing-service';
	let typed = $state('');
</script>

<ConfirmDialog
	title="Delete {project}?"
	description="Its deployments, environments and API keys are deleted with it. This cannot be undone."
	confirmLabel="Delete project"
	variant="destructive"
	confirmDisabled={typed !== project}
	onconfirm={() => (typed = '')}
	oncancel={() => (typed = '')}
>
	{#snippet trigger({ props })}
		<Button {...props} variant="outline">Delete project</Button>
	{/snippet}

	<div class="flex flex-col gap-2">
		<Label for="confirm-project">Type <strong>{project}</strong> to confirm</Label>
		<Input id="confirm-project" bind:value={typed} autocomplete="off" />
	</div>
</ConfirmDialog>
