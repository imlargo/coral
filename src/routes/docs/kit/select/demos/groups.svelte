<script lang="ts">
	import Select from '$lib/coral/kit/select/select.svelte';

	const specialties = [
		{
			label: 'Clinical',
			options: [
				{ value: 'general', label: 'General medicine' },
				{ value: 'pediatrics', label: 'Pediatrics' }
			]
		},
		{
			label: 'Surgical',
			options: [
				{ value: 'orthopedics', label: 'Orthopedics' },
				{ value: 'surgery', label: 'General surgery' }
			]
		}
	];

	let specialty = $state<string>();
</script>

<div class="w-64">
	<Select options={specialties} bind:value={specialty} placeholder="Select a specialty..." />
</div>
