<script lang="ts">
	import Select from '$lib/coral/kit/select/select.svelte';

	const specialties = [
		{
			label: 'Clínicas',
			options: [
				{ value: 'general', label: 'Medicina general' },
				{ value: 'pediatria', label: 'Pediatría' }
			]
		},
		{
			label: 'Quirúrgicas',
			options: [
				{ value: 'ortopedia', label: 'Ortopedia' },
				{ value: 'cirugia', label: 'Cirugía general' }
			]
		}
	];

	let specialty = $state<string>();
</script>

<div class="w-64">
	<Select
		options={specialties}
		bind:value={specialty}
		placeholder="Selecciona una especialidad..."
	/>
</div>
