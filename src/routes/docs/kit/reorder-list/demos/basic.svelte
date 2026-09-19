<script lang="ts">
	import ReorderList from '$lib/coral/kit/reorder-list/reorder-list.svelte';

	let stages = $state(['Lead', 'Contacted', 'Proposal sent', 'Negotiation', 'Closed']);
	let saves = $state(0);
</script>

<div class="flex w-72 flex-col gap-3">
	<ReorderList
		bind:items={stages}
		aria-label="Pipeline stages"
		itemClass="rounded-md border px-2 py-2 text-sm"
		handleLabel={(label) => `Move ${label}`}
		instructions="Press Space to pick up. Use the arrow keys to move, Space to drop and Escape to cancel."
		grabbed={(label, position, total) => `${label} picked up. Position ${position} of ${total}.`}
		moved={(label, position, total) => `${label} at position ${position} of ${total}.`}
		dropped={(label, position, total) => `${label} dropped at position ${position} of ${total}.`}
		cancelled={(label, position, total) =>
			`Cancelled. ${label} returns to position ${position} of ${total}.`}
		onreorder={() => saves++}
	/>
	<p class="text-sm text-muted-foreground">Saves: {saves} · one per drag, not per row</p>
</div>
