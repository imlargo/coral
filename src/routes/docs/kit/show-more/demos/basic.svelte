<script lang="ts">
	import ShowMore from '$lib/coral/kit/show-more/show-more.svelte';
</script>

<div class="flex w-96 flex-col gap-6 text-sm">
	<ShowMore lines={3} moreLabel="Ver más" lessLabel="Ver menos">
		<p>
			El contratista entregó la segunda fase con dos semanas de retraso por las lluvias de abril. La
			interventoría aprobó los ensayos de resistencia del concreto, pero pidió repetir el de la losa
			del tercer piso. El cronograma ajustado mueve la entrega final al 30 de agosto y no afecta el
			presupuesto. Queda pendiente la visita de la curaduría para la licencia de ocupación.
		</p>
	</ShowMore>

	<ShowMore lines={3} moreLabel="Ver más" lessLabel="Ver menos">
		<p>Una nota corta que cabe entera: aquí no aparece ningún botón.</p>
	</ShowMore>
</div>
