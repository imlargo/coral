<script lang="ts">
	import Timeline from '#lib/components/coral/kit/timeline/timeline.svelte';
	import Avatar from '#lib/components/coral/kit/avatar/avatar.svelte';

	type Event = { id: string; at: Date; who: string; what: string };

	const hours = (count: number) => new Date(Date.now() - count * 60 * 60 * 1000);

	const events: Event[] = [
		{ id: '1', at: hours(1), who: 'Amara Diallo', what: 'deployed api-gateway to production' },
		{ id: '2', at: hours(4), who: 'Wei Zhang', what: 'merged "Retry webhooks with backoff"' },
		{ id: '3', at: hours(27), who: 'Sofia Rossi', what: 'rotated the production API key' },
		{ id: '4', at: hours(31), who: 'Liam O’Connor', what: 'invited Priya Sharma to the team' },
		{ id: '5', at: hours(80), who: 'Kenji Tanaka', what: 'created the staging environment' }
	];
</script>

<Timeline
	items={events}
	getDate={(event) => event.at}
	getKey={(event) => event.id}
	class="w-full max-w-md"
	headingClass="text-sm font-medium text-muted-foreground"
>
	{#snippet item({ item })}
		<div class="flex items-center gap-2 text-sm">
			<Avatar name={item.who} size="sm" />
			<span><span class="font-medium">{item.who}</span> {item.what}</span>
		</div>
	{/snippet}
</Timeline>
