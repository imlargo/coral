<script lang="ts">
	import Toc from '$lib/coral/kit/toc/toc.svelte';
	import type { TocHeading } from '$lib/coral/kit/toc/types.js';

	// Headings the page already knows about - from a CMS payload, or a markdown pipeline - so
	// nothing is read back out of the DOM, and the ids are its doing rather than Coral's.
	const headings: TocHeading[] = [
		{ id: 'demo-resumen', text: 'Resumen', level: 2 },
		{ id: 'demo-alcance', text: 'Alcance', level: 2 },
		{ id: 'demo-entregables', text: 'Entregables', level: 3 },
		{ id: 'demo-plazos', text: 'Plazos', level: 3 },
		{ id: 'demo-anexos', text: 'Anexos', level: 2 }
	];

	let article = $state<HTMLElement | null>(null);
</script>

<div class="flex w-full max-w-2xl gap-8">
	<div bind:this={article} class="h-56 flex-1 overflow-y-auto rounded-lg border p-4">
		{#each headings as heading (heading.id)}
			<svelte:element
				this={heading.level === 2 ? 'h2' : 'h3'}
				id={heading.id}
				class="mt-4 font-medium first:mt-0 {heading.level === 3 ? 'text-sm' : 'text-base'}"
			>
				{heading.text}
			</svelte:element>
			<p class="mt-2 mb-6 text-sm text-muted-foreground">Contenido de «{heading.text}».</p>
		{/each}
	</div>

	<Toc
		{headings}
		root={article}
		offset={8}
		class="w-44 [--coral-toc-indent:1.25rem]"
		label="Contenido"
	/>
</div>
