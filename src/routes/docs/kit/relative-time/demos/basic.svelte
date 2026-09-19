<script lang="ts">
	import RelativeTime from '$lib/coral/kit/relative-time/relative-time.svelte';

	const minute = 60_000;
	const now = Date.now();
	const events = [
		{ what: 'New comment', at: now - 20_000 },
		{ what: 'Invoice paid', at: now - 7 * minute },
		{ what: 'Report generated', at: now - 5 * 60 * minute },
		{ what: 'Contract signed', at: now - 26 * 60 * minute },
		{ what: 'Meeting', at: now + 3 * 24 * 60 * minute }
	];
</script>

<ul class="flex w-80 flex-col gap-2 text-sm">
	{#each events as event (event.what)}
		<li class="flex justify-between gap-4">
			<span>{event.what}</span>
			<RelativeTime date={event.at} class="text-muted-foreground" />
		</li>
	{/each}
</ul>
