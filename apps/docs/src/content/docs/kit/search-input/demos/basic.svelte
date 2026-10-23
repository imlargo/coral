<script lang="ts">
	import SearchInput from '$lib/components/coral/kit/search-input/search-input.svelte';

	const fruits = ['Açaí', 'Guava', 'Kiwi', 'Lychee', 'Mango', 'Papaya', 'Passionfruit'];

	let term = $state('');
	let log = $state<string[]>([]);

	const fold = (text: string) =>
		text
			.normalize('NFD')
			.replace(/\p{Diacritic}/gu, '')
			.toLowerCase();
	const results = $derived(fruits.filter((fruit) => fold(fruit).includes(fold(term))));
</script>

<div class="flex w-80 flex-col gap-3">
	<SearchInput
		placeholder="Search fruit"
		aria-label="Search fruit"
		clearLabel="Clear search"
		onsearch={(next) => {
			term = next;
			log = [`onsearch("${next}")`, ...log].slice(0, 4);
		}}
	/>
	<ul class="text-sm">
		{#each results as fruit (fruit)}
			<li>{fruit}</li>
		{:else}
			<li class="text-muted-foreground">No results</li>
		{/each}
	</ul>
	<pre class="text-xs text-muted-foreground">{log.join('\n')}</pre>
</div>
