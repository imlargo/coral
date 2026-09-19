<script lang="ts">
	import Combobox from '$lib/coral/kit/combobox/combobox.svelte';

	const fruits = [
		{ value: 'acai', label: 'Açaí' },
		{ value: 'pina', label: 'Piña' },
		{ value: 'guarana', label: 'Guaraná' },
		{ value: 'maracuja', label: 'Maracujá' },
		{ value: 'lychee', label: 'Lychee' },
		{ value: 'kiwi', label: 'Kiwi' },
		{ value: 'papaya', label: 'Papaya' }
	];

	let fruit = $state<string>();
</script>

<div class="w-64">
	<!-- Type `acai`, `pina` or `guarana` - unaccented, as anyone actually types it. -->
	<Combobox
		options={fruits}
		bind:value={fruit}
		placeholder="Select a fruit..."
		searchPlaceholder="Try typing acai..."
		emptyMessage="No fruit found."
	/>
</div>
