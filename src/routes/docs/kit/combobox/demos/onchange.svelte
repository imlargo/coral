<script lang="ts">
	import Combobox from '$lib/coral/kit/combobox/combobox.svelte';
	import { Button } from '$lib/components/ui/button/index.js';

	const cities = [
		{ value: 'bogota', label: 'Bogotá' },
		{ value: 'medellin', label: 'Medellín' },
		{ value: 'cali', label: 'Cali' }
	];

	let city = $state<string>();
	let log = $state<string[]>([]);
</script>

<div class="flex w-72 flex-col gap-3">
	<Combobox
		options={cities}
		bind:value={city}
		placeholder="Select a city..."
		onchange={(option) => (log = [...log, `${option?.label ?? 'cleared'} (${option?.value})`])}
	/>

	<!-- Assigning to `value` from code does not fire onchange - nobody chose anything. -->
	<Button variant="outline" size="sm" onclick={() => (city = 'cali')}>Set to Cali in code</Button>

	<p class="text-sm text-muted-foreground">
		Selected: {city ?? 'none'} · onchange fired {log.length}
		{log.length === 1 ? 'time' : 'times'}
	</p>
</div>
