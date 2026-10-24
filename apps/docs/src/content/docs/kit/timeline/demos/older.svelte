<script lang="ts">
	import Timeline from '#lib/components/coral/kit/timeline/timeline.svelte';

	type Event = { id: number; at: Date; text: string };

	const DAY = 24 * 60 * 60 * 1000;
	const texts = ['Build passed', 'Deployed to staging', 'Rolled back', 'Deployed to production'];

	// Stands in for a paginated endpoint: each page is a few days older than the last.
	function page(index: number): Event[] {
		return Array.from({ length: 4 }, (_, offset) => {
			const id = index * 4 + offset;
			return { id, at: new Date(Date.now() - id * 0.6 * DAY), text: texts[id % texts.length] };
		});
	}

	let events = $state<Event[]>(page(0));
	let pages = $state(1);

	async function older() {
		await new Promise((resolve) => setTimeout(resolve, 600));
		events = [...events, ...page(pages)];
		pages += 1;
	}
</script>

<Timeline
	items={events}
	getDate={(event) => event.at}
	getKey={(event) => event.id}
	hasMore={pages < 4}
	onloadmore={older}
	class="w-full max-w-md"
	headingClass="text-sm font-medium text-muted-foreground"
>
	{#snippet item({ item })}
		<span class="text-sm">{item.text}</span>
	{/snippet}
</Timeline>
