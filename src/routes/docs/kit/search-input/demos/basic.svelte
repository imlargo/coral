<script lang="ts">
	import SearchInput from '$lib/coral/kit/search-input/search-input.svelte';

	const cities = [
		'Bogotá',
		'Medellín',
		'Cali',
		'Barranquilla',
		'Cartagena',
		'Bucaramanga',
		'Pereira'
	];

	let term = $state('');
	let log = $state<string[]>([]);

	const fold = (text: string) =>
		text
			.normalize('NFD')
			.replace(/\p{Diacritic}/gu, '')
			.toLowerCase();
	const results = $derived(cities.filter((city) => fold(city).includes(fold(term))));
</script>

<div class="flex w-80 flex-col gap-3">
	<SearchInput
		placeholder="Buscar ciudad"
		aria-label="Buscar ciudad"
		clearLabel="Limpiar búsqueda"
		onsearch={(next) => {
			term = next;
			log = [`onsearch("${next}")`, ...log].slice(0, 4);
		}}
	/>
	<ul class="text-sm">
		{#each results as city (city)}
			<li>{city}</li>
		{:else}
			<li class="text-muted-foreground">Sin resultados</li>
		{/each}
	</ul>
	<pre class="text-xs text-muted-foreground">{log.join('\n')}</pre>
</div>
