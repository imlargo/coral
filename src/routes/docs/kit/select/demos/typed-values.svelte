<script lang="ts">
	import Select from '$lib/coral/kit/select/select.svelte';

	// `value` is whatever the project already has - here a numeric id, not a string.
	const owners = [
		{ value: 1, label: 'Ana Restrepo' },
		{ value: 2, label: 'Camilo Ortiz' },
		{ value: 3, label: 'Daniela Ruiz' }
	];

	let ownerId = $state<number>();
</script>

<div class="flex w-64 flex-col gap-3">
	<Select options={owners} bind:value={ownerId} placeholder="Assign an owner..." />
	<p class="text-sm text-muted-foreground">
		Selected id: {ownerId ?? 'none'} ({typeof ownerId})
	</p>
</div>
