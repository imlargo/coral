<script lang="ts">
	import ConfirmDialog from '$lib/coral/kit/confirm-dialog/confirm-dialog.svelte';
	import { Button } from '$lib/components/ui/button/index.js';

	const affected = ['Contrato 2024-118', 'Contrato 2024-204', 'Contrato 2025-011'];
</script>

<ConfirmDialog
	title="¿Cerrar 3 contratos?"
	description="Esta acción no se puede deshacer."
	confirmLabel="Cerrar contratos"
	cancelLabel="Cancelar"
	variant="destructive"
>
	{#snippet trigger({ props })}
		<Button {...props} variant="outline">Cerrar seleccionados</Button>
	{/snippet}

	<!-- Anything between the description and the buttons: what exactly is affected. -->
	<ul class="list-inside list-disc text-sm text-muted-foreground">
		{#each affected as item (item)}
			<li>{item}</li>
		{/each}
	</ul>
</ConfirmDialog>
