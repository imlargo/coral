<script lang="ts">
	import Select from '$lib/coral/kit/select/select.svelte';

	const statuses = [
		{ value: 'draft', label: 'Draft' },
		{ value: 'review', label: 'In review' },
		{ value: 'approved', label: 'Approved' },
		{ value: 'archived', label: 'Archived', disabled: true }
	];

	let status = $state<string>();
</script>

<div class="w-64">
	<Select options={statuses} bind:value={status} placeholder="Select a status..." />
</div>
