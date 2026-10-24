<script lang="ts">
	import Select from '#lib/components/coral/kit/select/select.svelte';
	import { Button } from '#lib/components/ui/button/index.js';
	import type { Option } from '#lib/components/coral/lib/options.js';

	const REGIONS: Option<string>[] = [
		{ value: 'iad', label: 'N. Virginia' },
		{ value: 'gru', label: 'São Paulo' },
		{ value: 'fra', label: 'Frankfurt' },
		{ value: 'sin', label: 'Singapore' }
	];

	let options = $state<Option<string>[]>([]);
	let loading = $state(false);
	let region = $state<string>();

	async function load() {
		options = [];
		region = undefined;
		loading = true;
		await new Promise((resolve) => setTimeout(resolve, 1500));
		options = REGIONS;
		loading = false;
	}

	load();
</script>

<div class="flex w-64 flex-col gap-3">
	<Select {options} {loading} bind:value={region} placeholder="Select a region..." />
	<Button variant="outline" onclick={load} disabled={loading}>Reload the regions</Button>
</div>
