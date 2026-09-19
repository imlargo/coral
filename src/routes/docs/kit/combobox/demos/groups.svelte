<script lang="ts">
	import Combobox from '$lib/coral/kit/combobox/combobox.svelte';

	// Grouped, with descriptions and hidden keywords. `berry` finds Açaí; `4` finds Mango.
	const fruits = [
		{
			label: 'Tropical',
			options: [
				{ value: 'acai', label: 'Açaí', description: 'Berry', keywords: ['berry', '1'] },
				{ value: 'mango', label: 'Mango', description: 'Stone fruit', keywords: ['4'] },
				{ value: 'papaya', label: 'Papaya', description: 'Tropical' }
			]
		},
		{
			label: 'Citrus',
			options: [
				{ value: 'orange', label: 'Orange', description: 'Citrus' },
				{ value: 'lemon', label: 'Lemon', description: 'Citrus' },
				{ value: 'kumquat', label: 'Kumquat', description: 'Citrus', disabled: true }
			]
		}
	];

	let fruit = $state<string>();
</script>

<div class="w-72">
	<Combobox
		options={fruits}
		bind:value={fruit}
		clearable
		placeholder="Select a fruit..."
		searchPlaceholder="Try berry, mango, citrus..."
	/>
</div>
