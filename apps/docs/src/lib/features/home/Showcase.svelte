<script lang="ts">
	import ActivityCard from '#lib/features/home/showcase/ActivityCard.svelte';
	import ApiKeyCard from '#lib/features/home/showcase/ApiKeyCard.svelte';
	import BillingContactCard from '#lib/features/home/showcase/BillingContactCard.svelte';
	import BuildLogCard from '#lib/features/home/showcase/BuildLogCard.svelte';
	import BrandCard from '#lib/features/home/showcase/BrandCard.svelte';
	import CommandCard from '#lib/features/home/showcase/CommandCard.svelte';
	import DangerZoneCard from '#lib/features/home/showcase/DangerZoneCard.svelte';
	import DeploymentsCard from '#lib/features/home/showcase/DeploymentsCard.svelte';
	import DomainCard from '#lib/features/home/showcase/DomainCard.svelte';
	import FeedbackCard from '#lib/features/home/showcase/FeedbackCard.svelte';
	import FilesCard from '#lib/features/home/showcase/FilesCard.svelte';
	import FreezeCard from '#lib/features/home/showcase/FreezeCard.svelte';
	import InviteCard from '#lib/features/home/showcase/InviteCard.svelte';
	import MembersCard from '#lib/features/home/showcase/MembersCard.svelte';
	import OnboardingCard from '#lib/features/home/showcase/OnboardingCard.svelte';
	import PipelineCard from '#lib/features/home/showcase/PipelineCard.svelte';
	import RegionCard from '#lib/features/home/showcase/RegionCard.svelte';
	import ScalingCard from '#lib/features/home/showcase/ScalingCard.svelte';
	import TeamCard from '#lib/features/home/showcase/TeamCard.svelte';
	import UploadCard from '#lib/features/home/showcase/UploadCard.svelte';
	import ShowMore from '#lib/components/coral/kit/show-more/show-more.svelte';
	import { Button } from '#lib/components/ui/button/index.js';

	/** About a screen of the collage; the rest opens with the button, or on its own when focus lands in it. */
	const LINES = 40;

	let expanded = $state(false);
</script>

<ShowMore
	bind:expanded
	lines={LINES}
	class="items-stretch gap-6"
	contentClass={expanded ? '' : 'mask-b-from-60%'}
>
	<!-- Columns rather than a grid: cards keep their own height and the page fills without gaps. The
	     order reads top to bottom, column by column, so related cards sit together. -->
	<div class="columns-1 gap-5 p-px md:columns-2 lg:columns-3 xl:columns-4 2xl:columns-5 [&>*]:mb-5">
		<RegionCard />
		<InviteCard />
		<OnboardingCard />
		<ScalingCard />
		<CommandCard />
		<DangerZoneCard />
		<BuildLogCard />
		<UploadCard />
		<MembersCard />
		<BillingContactCard />
		<FreezeCard />
		<DeploymentsCard />
		<DomainCard />
		<ApiKeyCard />
		<PipelineCard />
		<FeedbackCard />
		<TeamCard />
		<FilesCard />
		<ActivityCard />
		<BrandCard />
	</div>

	{#snippet toggle({ props, expanded })}
		<Button {...props} variant="outline" class="self-center">
			{expanded ? 'Show fewer' : 'Show every card'}
		</Button>
	{/snippet}
</ShowMore>
