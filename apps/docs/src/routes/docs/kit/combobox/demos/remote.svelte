<script lang="ts">
	import Combobox from '$lib/components/coral/kit/combobox/combobox.svelte';
	import { fold } from '$lib/components/coral/kit/combobox/fold.js';

	// Stands in for a paginated endpoint: too many rows to ship to the client.
	const CATALOG = Array.from({ length: 400 }, (_, i) => ({
		value: i + 1,
		label: `repo-${String(i + 1).padStart(3, '0')}`,
		description: i % 3 === 0 ? 'N. Virginia' : i % 3 === 1 ? 'São Paulo' : 'Frankfurt'
	}));

	let options = $state<typeof CATALOG>([]);
	let loading = $state(false);
	let repoId = $state<number>();
	let requests = $state(0);

	async function fetchOptions(search: string) {
		loading = true;
		requests += 1;
		await new Promise((r) => setTimeout(r, 220));
		// Folding is the server's job once the server owns the search: `sao paulo` still has to
		// find `São Paulo` there. Same `fold` the component uses when it filters on the client.
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
		bind:value={repoId}
		shouldFilter={false}
		onsearch={fetchOptions}
		searchDebounce={300}
		placeholder="Select a repository..."
		searchPlaceholder="Search 400 repositories..."
		emptyMessage="No repository matches."
	/>
	<p class="text-sm text-muted-foreground">
		Showing {options.length} · {requests} request{requests === 1 ? '' : 's'} sent
	</p>
</div>
