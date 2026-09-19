<script lang="ts">
	import Combobox from '$lib/coral/kit/combobox/combobox.svelte';

	// `value` is whatever the project already has - here a numeric id, not a string.
	const clients = [
		{ value: 1, label: 'Aurora Energy' },
		{ value: 2, label: 'Andes Construction' },
		{ value: 3, label: 'Savanna Group', disabled: true },
		{ value: 4, label: 'Northfield Textiles' }
	];

	let clientId = $state<number>();
</script>

<div class="flex w-64 flex-col gap-3">
	<Combobox
		options={clients}
		bind:value={clientId}
		placeholder="Select a client..."
		searchPlaceholder="Search clients..."
		emptyMessage="No client found."
	/>
	<p class="text-sm text-muted-foreground">
		Selected id: {clientId ?? 'none'} ({typeof clientId})
	</p>
</div>
