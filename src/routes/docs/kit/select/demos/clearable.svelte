<script lang="ts">
	import Select from '$lib/coral/kit/select/select.svelte';

	const priorities = [
		{ value: 'low', label: 'Low', description: 'Whenever there is room' },
		{ value: 'normal', label: 'Normal', description: 'The default queue' },
		{ value: 'high', label: 'High', description: 'Ahead of everything else' }
	];

	let priority = $state<string | undefined>('normal');
</script>

<div class="flex w-72 flex-col gap-3">
	<Select options={priorities} bind:value={priority} clearable placeholder="No priority" />
	<p class="text-sm text-muted-foreground">Value: {priority ?? 'undefined'}</p>
</div>
