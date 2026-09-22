<script lang="ts">
	import Select from '$lib/components/coral/kit/select/select.svelte';

	const regions = [
		{
			label: 'Americas',
			options: [
				{ value: 'us-east-1', label: 'N. Virginia' },
				{ value: 'sa-east-1', label: 'São Paulo' }
			]
		},
		{
			label: 'Europe',
			options: [
				{ value: 'eu-west-1', label: 'Ireland' },
				{ value: 'eu-central-1', label: 'Frankfurt' }
			]
		}
	];

	let region = $state<string>();
</script>

<div class="w-64">
	<Select options={regions} bind:value={region} placeholder="Select a region..." />
</div>
