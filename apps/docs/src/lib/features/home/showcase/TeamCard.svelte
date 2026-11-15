<script lang="ts">
	import AvatarStack from '#lib/components/coral/kit/avatar-stack/avatar-stack.svelte';
	import ShowcaseCard from '#lib/features/home/showcase/ShowcaseCard.svelte';
	import { PROJECT, TEAM } from '#lib/features/home/world.js';

	const SEATS = 10;
</script>

<ShowcaseCard
	title="Team"
	description="Who has access to {PROJECT}."
	hint="The stack keeps four places and folds the rest into a count a screen reader hears as “5 more members”."
	components={['kit/avatar-stack']}
>
	<div class="flex flex-wrap items-center justify-between gap-3">
		<AvatarStack
			items={TEAM}
			max={4}
			label="Members of {PROJECT}"
			getKey={(member) => member.id}
			getPerson={(member) => ({ name: member.name })}
			overflowLabel={(count) => `${count} more ${count === 1 ? 'member' : 'members'}`}
		/>
		<p class="text-sm text-muted-foreground">{TEAM.length} of {SEATS} seats used</p>
	</div>
</ShowcaseCard>
