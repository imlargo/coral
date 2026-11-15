<script lang="ts">
	import UsersIcon from '@lucide/svelte/icons/users';
	import Avatar from '#lib/components/coral/kit/avatar/avatar.svelte';
	import SearchInput from '#lib/components/coral/kit/search-input/search-input.svelte';
	import { fold } from '#lib/components/coral/lib/fold.js';
	import { Badge } from '#lib/components/ui/badge/index.js';
	import * as Empty from '#lib/components/ui/empty/index.js';
	import { Label } from '#lib/components/ui/label/index.js';
	import { TEAM } from '#lib/features/home/world.js';
	import ShowcaseCard from './ShowcaseCard.svelte';

	let term = $state('');

	const query = $derived(fold(term.trim()));
	const matches = $derived(
		TEAM.filter((member) =>
			[member.name, member.email, member.role].some((field) => fold(field).includes(query))
		)
	);
</script>

<ShowcaseCard
	title="Members"
	description="Everyone with access to web-app, by name, email or role."
	hint="Search for admin or o'connor, then press Escape: it clears the term before anything else."
	components={['kit/search-input', 'kit/avatar']}
>
	<div class="grid gap-2">
		<Label for="home-members-search">Search members</Label>
		<SearchInput
			id="home-members-search"
			bind:value={term}
			placeholder="Name, email or role"
			clearLabel="Clear search"
		/>
	</div>

	{#if matches.length > 0}
		<ul class="grid gap-3" aria-label="Members">
			{#each matches as member (member.id)}
				<li class="flex min-w-0 items-center gap-3">
					<Avatar name={member.name} />
					<div class="flex min-w-0 flex-1 flex-col">
						<span class="truncate text-sm font-medium">{member.name}</span>
						<span class="truncate text-xs text-muted-foreground">{member.email}</span>
					</div>
					<Badge variant="secondary">{member.role}</Badge>
				</li>
			{/each}
		</ul>
	{:else}
		<Empty.Root>
			<Empty.Header>
				<Empty.Media variant="icon">
					<UsersIcon />
				</Empty.Media>
				<Empty.Title>No members match "{term.trim()}"</Empty.Title>
				<Empty.Description>Search by name, email or role, or clear the search.</Empty.Description>
			</Empty.Header>
		</Empty.Root>
	{/if}
	<p class="sr-only" aria-live="polite">
		{matches.length === 1 ? '1 member' : `${matches.length} members`}
	</p>
</ShowcaseCard>
