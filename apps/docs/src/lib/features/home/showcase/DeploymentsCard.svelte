<script lang="ts">
	import { onMount } from 'svelte';
	import Avatar from '#lib/components/coral/kit/avatar/avatar.svelte';
	import ShowMore from '#lib/components/coral/kit/show-more/show-more.svelte';
	import Timeline from '#lib/components/coral/kit/timeline/timeline.svelte';
	import ShowcaseCard from '#lib/features/home/showcase/ShowcaseCard.svelte';
	import { TEAM, type Member } from '#lib/features/home/world.js';

	type Deploy = { id: string; at: Date; author: Member; action: string; message: string };

	const member = (id: string) => TEAM.find((entry) => entry.id === id) ?? TEAM[0];

	// A fixed instant renders the same markup on the server and on hydration; the reader's own
	// clock takes over once mounted.
	let now = $state(new Date('2026-11-15T15:00:00Z'));
	onMount(() => {
		now = new Date();
	});

	const ago = (hours: number) => new Date(now.getTime() - hours * 60 * 60 * 1000);

	const deploys = $derived<Deploy[]>([
		{
			id: 'd5',
			at: ago(0.6),
			author: member('amara'),
			action: 'deployed 4f2c1a9 to Production',
			message: 'Bump the session cookie lifetime to 14 days'
		},
		{
			id: 'd4',
			at: ago(3.2),
			author: member('wei'),
			action: 'promoted Preview to Production',
			message: 'Add the region picker to the project settings'
		},
		{
			id: 'd3',
			at: ago(26),
			author: member('sofia'),
			action: 'deployed b81e07d to Preview',
			message:
				'Retry webhook deliveries with exponential backoff. Deliveries that fail with a 5xx or time out are retried up to six times, waiting 30 s, 2 min, 10 min, 1 h, 6 h and 24 h. Each attempt is logged on the webhook page with its status code and response time, and a delivery that runs out of attempts disables the endpoint and emails its owner.'
		},
		{
			id: 'd2',
			at: ago(29),
			author: member('liam'),
			action: 'rolled Production back to 9c4d2e1',
			message: 'Revert "Move image resizing to the edge"'
		},
		{
			id: 'd1',
			at: ago(74),
			author: member('priya'),
			action: 'deployed 2a7f9b3 to Development',
			message: 'Read the API key from the environment instead of the config file'
		}
	]);
</script>

<ShowcaseCard
	title="Deployments"
	description="Recent deploys of web-app, grouped by day in your own time zone."
	hint="Days are cut in your time zone; the long commit message is clamped to two lines with a toggle."
	components={['kit/timeline', 'kit/show-more', 'kit/avatar']}
>
	<Timeline
		items={deploys}
		getDate={(deploy) => deploy.at}
		getKey={(deploy) => deploy.id}
		{now}
		locale="en-US"
		headingClass="text-xs font-medium text-muted-foreground"
		itemClass="text-sm"
	>
		{#snippet item({ item })}
			<div class="flex min-w-0 flex-col gap-1">
				<div class="flex min-w-0 items-center gap-2">
					<Avatar name={item.author.name} size="sm" />
					<p class="min-w-0">
						<span class="font-medium">{item.author.name}</span>
						{item.action}
					</p>
				</div>
				<ShowMore lines={2}>
					<p class="text-muted-foreground">{item.message}</p>
				</ShowMore>
			</div>
		{/snippet}
	</Timeline>
</ShowcaseCard>
