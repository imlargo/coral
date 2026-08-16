<script lang="ts">
	import Combobox from '$lib/coral/kit/combobox/combobox.svelte';

	const departments = [
		{ value: 'antioquia', label: 'Antioquia' },
		{ value: 'bolivar', label: 'Bolívar' },
		{ value: 'boyaca', label: 'Boyacá' },
		{ value: 'caqueta', label: 'Caquetá' },
		{ value: 'choco', label: 'Chocó' },
		{ value: 'narino', label: 'Nariño' },
		{ value: 'quindio', label: 'Quindío' }
	];

	let department = $state<string>();
</script>

<div class="w-64">
	<!-- Type `narino`, `boyaca` or `choco` - unaccented, as anyone actually types it. -->
	<Combobox
		options={departments}
		bind:value={department}
		placeholder="Select a department..."
		searchPlaceholder="Try typing narino..."
		emptyMessage="No department found."
	/>
</div>
