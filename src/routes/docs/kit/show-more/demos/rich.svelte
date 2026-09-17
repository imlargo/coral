<script lang="ts">
	import ShowMore from '$lib/coral/kit/show-more/show-more.svelte';
	import { Button } from '$lib/components/ui/button/index.js';

	let expanded = $state(false);
</script>

<div class="w-96 text-sm">
	<ShowMore lines={4} bind:expanded>
		<p class="mb-2">Novedades de la versión 2.4:</p>
		<ul class="list-disc ps-5">
			<li>Exportación de reportes a Excel.</li>
			<li>Filtros guardados por usuario.</li>
			<li>Firma electrónica en órdenes de compra.</li>
			<li>Notificaciones por correo configurables.</li>
			<li><a class="underline" href="#main-content">Ver el historial completo</a></li>
		</ul>

		{#snippet toggle({ props, expanded })}
			<Button {...props} variant="outline" size="sm">
				{expanded ? 'Ocultar novedades' : 'Todas las novedades'}
			</Button>
		{/snippet}
	</ShowMore>
	<p class="mt-2 text-muted-foreground">Tab hasta el enlace oculto también lo despliega.</p>
</div>
