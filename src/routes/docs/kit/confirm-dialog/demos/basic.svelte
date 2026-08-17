<script lang="ts">
	import ConfirmDialog from '$lib/coral/kit/confirm-dialog/confirm-dialog.svelte';
	import { Button } from '$lib/components/ui/button/index.js';

	let removed = $state(0);
</script>

<div class="flex flex-col items-center gap-3">
	<ConfirmDialog
		title="¿Desactivar Metro cuadrado?"
		description="Su historial se conserva y puedes reactivarla cuando quieras."
		confirmLabel="Desactivar"
		cancelLabel="Cancelar"
		variant="destructive"
		onconfirm={() => removed++}
	>
		{#snippet trigger({ props })}
			<Button {...props} variant="outline">Desactivar unidad</Button>
		{/snippet}
	</ConfirmDialog>

	<p class="text-sm text-muted-foreground">Desactivadas: {removed}</p>
</div>
