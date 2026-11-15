<script lang="ts">
	import Gauge from '#lib/components/coral/kit/gauge/gauge.svelte';
	import { Slider } from '#lib/components/ui/slider/index.js';

	let used = $state(84);

	// What counts as too much is the product's call, so the colour is worked out here.
	const color = $derived(used >= 90 ? 'var(--destructive)' : 'var(--primary)');
</script>

<div class="flex w-full max-w-xs flex-col items-center gap-6">
	<Gauge value={used} {color} aria-label="API requests this month" />
	<Slider type="single" bind:value={used} max={100} aria-label="Requests used" />
</div>
