<script lang="ts">
	import ReorderList from '$lib/coral/kit/reorder-list/reorder-list.svelte';

	let stages = $state(['Prospecto', 'Contactado', 'Propuesta enviada', 'Negociación', 'Cerrado']);
	let saves = $state(0);
</script>

<div class="flex w-72 flex-col gap-3">
	<ReorderList
		bind:items={stages}
		aria-label="Etapas del embudo"
		itemClass="rounded-md border px-2 py-2 text-sm"
		handleLabel={(label) => `Mover ${label}`}
		instructions="Pulsa Espacio para tomar. Usa las flechas para mover, Espacio para soltar y Escape para cancelar."
		grabbed={(label, position, total) => `${label} tomado. Posición ${position} de ${total}.`}
		moved={(label, position, total) => `${label} en la posición ${position} de ${total}.`}
		dropped={(label, position, total) => `${label} soltado en la posición ${position} de ${total}.`}
		cancelled={(label, position, total) =>
			`Cancelado. ${label} vuelve a la posición ${position} de ${total}.`}
		onreorder={() => saves++}
	/>
	<p class="text-sm text-muted-foreground">Guardados: {saves} · uno por arrastre, no por fila</p>
</div>
