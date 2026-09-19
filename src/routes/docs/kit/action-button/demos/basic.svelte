<script lang="ts">
	import ActionButton from '$lib/coral/kit/action-button/action-button.svelte';

	let saved = $state(0);

	async function save() {
		await new Promise((resolve) => setTimeout(resolve, 1200));
		saved++;
	}
</script>

<div class="flex flex-col items-center gap-3">
	<ActionButton onclick={save} pendingLabel="Saving">
		{#snippet children({ pending })}
			{pending ? 'Saving…' : 'Save changes'}
		{/snippet}
	</ActionButton>
	<p class="text-sm text-muted-foreground">Saved: {saved} · click multiple times in a row</p>
</div>
