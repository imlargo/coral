<script lang="ts">
	import Toc from '$lib/coral/kit/toc/toc.svelte';

	// The article scrolls inside its own box here, so the demo does not hijack the page. In a normal
	// page you leave `root` out and the table of contents follows the window.
	let article = $state<HTMLElement | null>(null);
	let active = $state('');

	const sections = [
		[
			'Instalación',
			'Copia la carpeta a tu proyecto y agrega los primitivos de shadcn que declara el manifiesto. Desde ese momento el código es tuyo y se versiona con el resto del repositorio.'
		],
		[
			'Uso',
			'Importa el componente por su ruta de archivo: no hay barriles. Pasa el contenedor cuando el artículo viva dentro de un panel con su propio scroll, como en esta demo.'
		],
		[
			'Props',
			'Todo lo que acepta el elemento envuelto sigue disponible. Lo que agrega Coral es el cálculo del encabezado activo y los anclajes que faltan.'
		],
		[
			'Accesibilidad',
			'El enlace activo lleva aria-current="location", y tras un desplazamiento suave el foco queda en el encabezado, no al principio de la página.'
		]
	];
</script>

<div class="flex w-full max-w-2xl gap-8">
	<div
		bind:this={article}
		class="h-64 flex-1 [scroll-padding-top:1rem] overflow-y-auto rounded-lg border p-4 [&_h2]:scroll-mt-0"
	>
		{#each sections as [title, body] (title)}
			<h2 class="mt-4 text-base font-medium first:mt-0">{title}</h2>
			<p class="mt-2 mb-10 text-sm text-muted-foreground">{body}</p>
		{/each}
	</div>

	<div class="w-44 shrink-0">
		<Toc
			container={article}
			root={article}
			offset={24}
			bind:active
			label="En esta página"
			minHeadings={1}
		>
			{#snippet heading()}
				<span class="text-xs font-medium tracking-wider text-muted-foreground uppercase">
					En esta página
				</span>
			{/snippet}
		</Toc>
		<p class="mt-3 text-xs text-muted-foreground">Activa: {active || '—'}</p>
	</div>
</div>
