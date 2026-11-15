<script lang="ts">
	import Combobox from '#lib/components/coral/kit/combobox/combobox.svelte';
	import { Label } from '#lib/components/ui/label/index.js';
	import { PROJECT, REGIONS } from '#lib/features/home/world.js';
	import ShowcaseCard from './ShowcaseCard.svelte';

	let region = $state<string | undefined>('iad');

	const selected = $derived(REGIONS.find((entry) => entry.value === region));
</script>

<ShowcaseCard
	title="Deploy region"
	description={`Where ${PROJECT} runs. The list searches labels and region codes alike.`}
	hint="Type sao, zurich or krakow: accents are folded, so the unaccented spelling still matches."
	components={['kit/combobox']}
>
	<div class="grid gap-2">
		<Label for="home-region">Region</Label>
		<Combobox
			id="home-region"
			options={REGIONS}
			bind:value={region}
			placeholder="Pick a region"
			searchPlaceholder="Search regions..."
			emptyMessage="No region matches that."
		/>
	</div>
	<p class="text-sm text-muted-foreground" aria-live="polite">
		{#if selected}
			Deploying to <span class="font-medium text-foreground">{selected.label}</span>
			({selected.description})
		{:else}
			No region picked. Deploys are on hold.
		{/if}
	</p>
</ShowcaseCard>
