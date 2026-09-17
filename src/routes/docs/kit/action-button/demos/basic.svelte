<script lang="ts">
	import ActionButton from '$lib/coral/kit/action-button/action-button.svelte';

	let saved = $state(0);

	async function save() {
		await new Promise((resolve) => setTimeout(resolve, 1200));
		saved++;
	}
</script>

<div class="flex flex-col items-center gap-3">
	<ActionButton onclick={save} pendingLabel="Guardando">
		{#snippet children({ pending })}
			{pending ? 'Guardando…' : 'Guardar cambios'}
		{/snippet}
	</ActionButton>
	<p class="text-sm text-muted-foreground">Guardados: {saved} · haz clic varias veces seguidas</p>
</div>
