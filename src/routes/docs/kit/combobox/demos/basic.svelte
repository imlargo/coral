<script lang="ts">
	import Combobox from '$lib/coral/kit/combobox/combobox.svelte';

	const fruits = [
		{ value: 'apple', label: 'Apple' },
		{ value: 'mango', label: 'Mango' },
		{ value: 'kiwi', label: 'Kiwi' },
		{ value: 'guava', label: 'Guava' },
		{ value: 'lychee', label: 'Lychee' }
	];

	let fruit = $state<string>();
</script>

<div class="w-64">
	<Combobox
		options={fruits}
		bind:value={fruit}
		placeholder="Select a fruit..."
		searchPlaceholder="Search fruits..."
		emptyMessage="No fruit found."
	/>
</div>
