<script lang="ts">
	import RatingGroup from '$lib/coral/kit/rating-group/rating-group.svelte';

	let value = $state(7);
</script>

<!-- Ten stars, bigger, on a chart token instead of the primary. -->
<RatingGroup
	bind:value
	count={10}
	color="var(--chart-2)"
	class="gap-1.5 [--coral-star:1.75rem]"
	aria-label="Nivel"
/>
