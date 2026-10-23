<script lang="ts">
	import Combobox from '$lib/components/coral/kit/combobox/combobox.svelte';
	import { Button } from '$lib/components/ui/button/index.js';

	const fruits = [
		{ value: 'acai', label: 'Açaí' },
		{ value: 'mango', label: 'Mango' },
		{ value: 'kiwi', label: 'Kiwi' }
	];

	let fruit = $state<string>();
	let log = $state<string[]>([]);
</script>

<div class="flex w-72 flex-col gap-3">
	<Combobox
		options={fruits}
		bind:value={fruit}
		placeholder="Select a fruit..."
		onchange={(option) => (log = [...log, `${option?.label ?? 'cleared'} (${option?.value})`])}
	/>

	<!-- Assigning to `value` from code does not fire onchange - nobody chose anything. -->
	<Button variant="outline" size="sm" onclick={() => (fruit = 'mango')}>Set to Mango in code</Button
	>

	<p class="text-sm text-muted-foreground">
		Selected: {fruit ?? 'none'} · onchange fired {log.length}
		{log.length === 1 ? 'time' : 'times'}
	</p>
</div>
