<script lang="ts">
	import ActionButton from '$lib/components/coral/kit/action-button/action-button.svelte';

	let deploys = $state(0);

	async function deploy() {
		await new Promise((resolve) => setTimeout(resolve, 1200));
		deploys++;
	}
</script>

<div class="flex flex-col items-center gap-3">
	<ActionButton onclick={deploy} pendingLabel="Deploying">
		{#snippet children({ pending })}
			{pending ? 'Deploying…' : 'Deploy to production'}
		{/snippet}
	</ActionButton>
	<p class="text-sm text-muted-foreground">Deploys: {deploys} · click multiple times in a row</p>
</div>
