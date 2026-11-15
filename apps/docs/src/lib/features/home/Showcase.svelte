<script lang="ts">
	import ActivityCard from '#lib/features/home/showcase/ActivityCard.svelte';
	import ApiKeyCard from '#lib/features/home/showcase/ApiKeyCard.svelte';
	import BrandCard from '#lib/features/home/showcase/BrandCard.svelte';
	import CommandCard from '#lib/features/home/showcase/CommandCard.svelte';
	import DangerZoneCard from '#lib/features/home/showcase/DangerZoneCard.svelte';
	import DeploymentsCard from '#lib/features/home/showcase/DeploymentsCard.svelte';
	import FilesCard from '#lib/features/home/showcase/FilesCard.svelte';
	import FreezeCard from '#lib/features/home/showcase/FreezeCard.svelte';
	import InviteCard from '#lib/features/home/showcase/InviteCard.svelte';
	import MembersCard from '#lib/features/home/showcase/MembersCard.svelte';
	import PipelineCard from '#lib/features/home/showcase/PipelineCard.svelte';
	import RegionCard from '#lib/features/home/showcase/RegionCard.svelte';
	import ScalingCard from '#lib/features/home/showcase/ScalingCard.svelte';
	import TeamCard from '#lib/features/home/showcase/TeamCard.svelte';
	import UploadCard from '#lib/features/home/showcase/UploadCard.svelte';
</script>

<!-- Columns rather than a grid: cards keep their own height and the page fills without gaps. The
     order reads top to bottom, column by column, so related cards sit together. -->
<div class="columns-1 gap-4 md:columns-2 xl:columns-3 [&>*]:mb-4">
	<RegionCard />
	<InviteCard />
	<ScalingCard />
	<CommandCard />
	<DangerZoneCard />
	<UploadCard />
	<MembersCard />
	<FreezeCard />
	<DeploymentsCard />
	<ApiKeyCard />
	<PipelineCard />
	<TeamCard />
	<FilesCard />
	<ActivityCard />
	<BrandCard />
</div>
