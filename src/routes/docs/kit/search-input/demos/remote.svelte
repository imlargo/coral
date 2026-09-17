<script lang="ts">
	import SearchInput from '$lib/coral/kit/search-input/search-input.svelte';

	let loading = $state(false);
	let requests = $state(0);
	let results = $state<string[]>([]);

	async function search(term: string) {
		if (term === '') {
			results = [];
			return;
		}
		loading = true;
		requests++;
		await new Promise((resolve) => setTimeout(resolve, 600));
		results = [`${term} — cliente`, `${term} — proveedor`, `${term} — contacto`];
		loading = false;
	}
</script>

<div class="flex w-80 flex-col gap-3">
	<SearchInput
		placeholder="Escribe al menos 3 letras"
		aria-label="Buscar en el directorio"
		minLength={3}
		debounce={400}
		{loading}
		onsearch={search}
	/>
	<p class="text-xs text-muted-foreground">Peticiones enviadas: {requests}</p>
	<ul class="text-sm">
		{#each results as result (result)}
			<li>{result}</li>
		{/each}
	</ul>
</div>
