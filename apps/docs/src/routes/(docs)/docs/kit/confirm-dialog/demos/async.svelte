<script lang="ts">
	import ConfirmDialog from '$lib/components/coral/kit/confirm-dialog/confirm-dialog.svelte';
	import { Button } from '$lib/components/ui/button/index.js';

	let open = $state(false);
	let log = $state<string[]>([]);
	// Fails the first time, succeeds after that - the shape of a real request.
	let attempts = $state(0);

	async function save() {
		attempts++;
		await new Promise((r) => setTimeout(r, 900));
		if (attempts === 1) {
			log = [...log, 'error: a build is still running'];
			throw new Error('build running');
		}
		log = [...log, 'deleted'];
	}
</script>

<div class="flex flex-col items-center gap-3">
	<Button variant="outline" onclick={() => (open = true)}>Try it (fails the first time)</Button>

	<ConfirmDialog
		bind:open
		title="Delete this deployment?"
		description="It can't be deleted while a build is still running."
		confirmLabel="Delete"
		cancelLabel="Cancel"
		variant="destructive"
		onconfirm={save}
	/>

	<ul class="text-sm text-muted-foreground">
		{#each log as entry, i (i)}
			<li>{entry}</li>
		{/each}
	</ul>
</div>
