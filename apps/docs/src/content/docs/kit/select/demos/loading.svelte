<script lang="ts">
	import Select from '#lib/components/coral/kit/select/select.svelte';
	import { Button } from '#lib/components/ui/button/index.js';
	import type { Option } from '#lib/components/coral/lib/options.js';

	let environments = $state<Option<string>[]>([]);
	let loading = $state(false);
	let environment = $state<string>();

	// Stands in for a request that takes a moment.
	async function load() {
		environments = [];
		loading = true;
		await new Promise((resolve) => setTimeout(resolve, 1500));
		environments = [
			{ value: 'production', label: 'Production' },
			{ value: 'staging', label: 'Staging' },
			{ value: 'preview', label: 'Preview' }
		];
		loading = false;
	}

	load();
</script>

<div class="flex w-72 flex-col gap-3">
	<Select
		options={environments}
		{loading}
		bind:value={environment}
		placeholder="Select an environment..."
		loadingLabel="Loading environments"
	/>
	<Button variant="outline" size="sm" onclick={load}>Load again</Button>
</div>
