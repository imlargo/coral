<script lang="ts">
	import Combobox from '$lib/coral/kit/combobox/combobox.svelte';
	import { fold } from '$lib/coral/kit/combobox/fold.js';

	// Stands in for a paginated endpoint: too many rows to ship to the client.
	const CATALOG = Array.from({ length: 400 }, (_, i) => ({
		value: i + 1,
		label: `Proyecto ${String(i + 1).padStart(3, '0')}`,
		description: i % 3 === 0 ? 'Antioquia' : i % 3 === 1 ? 'Boyacá' : 'Atlántico'
	}));

	let options = $state<typeof CATALOG>([]);
	let loading = $state(false);
	let projectId = $state<number>();
	let requests = $state(0);

	async function fetchOptions(search: string) {
		loading = true;
		requests += 1;
		await new Promise((r) => setTimeout(r, 220));
		// Folding is the server's job once the server owns the search: `boyaca` still has to find
		// `Boyacá` there. Same `fold` the component uses when it filters on the client.
		const needle = fold(search.trim());
		options = CATALOG.filter(
			(o) => !needle || fold(o.label).includes(needle) || fold(o.description).includes(needle)
		).slice(0, 20);
		loading = false;
	}

	fetchOptions('');
</script>

<div class="flex w-72 flex-col gap-3">
	<!-- The server already filtered, so the client must not filter again. -->
	<Combobox
		{options}
		{loading}
		bind:value={projectId}
		shouldFilter={false}
		onsearch={fetchOptions}
		searchDebounce={300}
		placeholder="Select a project..."
		searchPlaceholder="Search 400 projects..."
		emptyMessage="No project matches."
	/>
	<p class="text-sm text-muted-foreground">
		Showing {options.length} · {requests} request{requests === 1 ? '' : 's'} sent
	</p>
</div>
