<script lang="ts">
	import Combobox from '$lib/coral/kit/combobox/combobox.svelte';

	// Grouped, with descriptions and hidden keywords. `dc` finds Bogotá; `4` finds Cali.
	const cities = [
		{
			label: 'Andina',
			options: [
				{ value: 'bogota', label: 'Bogotá', description: 'Cundinamarca', keywords: ['dc', '1'] },
				{ value: 'medellin', label: 'Medellín', description: 'Antioquia', keywords: ['4'] },
				{ value: 'tunja', label: 'Tunja', description: 'Boyacá' }
			]
		},
		{
			label: 'Caribe',
			options: [
				{ value: 'barranquilla', label: 'Barranquilla', description: 'Atlántico' },
				{ value: 'cartagena', label: 'Cartagena', description: 'Bolívar' },
				{ value: 'santa-marta', label: 'Santa Marta', description: 'Magdalena', disabled: true }
			]
		}
	];

	let city = $state<string>();
</script>

<div class="w-72">
	<Combobox
		options={cities}
		bind:value={city}
		clearable
		placeholder="Select a city..."
		searchPlaceholder="Try dc, boyaca, atlantico..."
	/>
</div>
