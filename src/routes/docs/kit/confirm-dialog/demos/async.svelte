<script lang="ts">
	import ConfirmDialog from '$lib/coral/kit/confirm-dialog/confirm-dialog.svelte';
	import { Button } from '$lib/components/ui/button/index.js';

	let open = $state(false);
	let log = $state<string[]>([]);
	// Fails the first time, succeeds after that - the shape of a real request.
	let attempts = $state(0);

	async function save() {
		attempts++;
		await new Promise((r) => setTimeout(r, 900));
		if (attempts === 1) {
			log = [...log, 'error: la unidad está en uso'];
			throw new Error('in use');
		}
		log = [...log, 'desactivada'];
	}
</script>

<div class="flex flex-col items-center gap-3">
	<Button variant="outline" onclick={() => (open = true)}>Intentar (falla la 1ª vez)</Button>

	<ConfirmDialog
		bind:open
		title="¿Desactivar Metro cuadrado?"
		description="Si está en uso por un insumo activo, no podrá desactivarse."
		confirmLabel="Desactivar"
		cancelLabel="Cancelar"
		variant="destructive"
		onconfirm={save}
	/>

	<ul class="text-sm text-muted-foreground">
		{#each log as entry, i (i)}
			<li>{entry}</li>
		{/each}
	</ul>
</div>
