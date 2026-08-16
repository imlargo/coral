<script lang="ts">
	import Combobox from '$lib/coral/kit/combobox/combobox.svelte';

	const cities = [
		{ value: 'bogota', label: 'Bogotá' },
		{ value: 'medellin', label: 'Medellín' },
		{ value: 'cali', label: 'Cali' },
		{ value: 'barranquilla', label: 'Barranquilla' },
		{ value: 'cartagena', label: 'Cartagena' }
	];

	let city = $state<string>();
</script>

<div class="w-64">
	<Combobox
		options={cities}
		bind:value={city}
		placeholder="Select a city..."
		searchPlaceholder="Search cities..."
		emptyMessage="No city found."
	/>
</div>
