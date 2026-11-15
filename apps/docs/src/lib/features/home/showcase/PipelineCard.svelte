<script lang="ts">
	import ReorderList from '#lib/components/coral/kit/reorder-list/reorder-list.svelte';
	import ShowcaseCard from '#lib/features/home/showcase/ShowcaseCard.svelte';
	import { PROJECT } from '#lib/features/home/world.js';

	let stages = $state(['Install', 'Lint', 'Test', 'Build', 'Deploy']);
	let saved = $state<string[]>([]);
	let saves = $state(0);
</script>

<ShowcaseCard
	title="Pipeline"
	description="The order {PROJECT} runs its build stages in."
	hint="Drag a grip, or focus it and press Space, then the arrow keys: the order is saved once per drop."
	components={['kit/reorder-list']}
>
	<div class="flex min-w-0 flex-col gap-3">
		<ReorderList
			bind:items={stages}
			aria-label="Build stages"
			itemClass="rounded-md border px-2 py-2 text-sm"
			onreorder={(items) => {
				saved = [...items];
				saves++;
			}}
		/>
		<p class="text-sm text-muted-foreground">
			{saves === 0
				? 'Not saved yet: move a stage.'
				: `Saved ${saves === 1 ? 'once' : `${saves} times`}: ${saved.join(' → ')}`}
		</p>
	</div>
</ShowcaseCard>
