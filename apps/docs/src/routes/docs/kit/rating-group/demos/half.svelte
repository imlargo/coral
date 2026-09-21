<script lang="ts">
	import RatingGroup from '$lib/components/coral/kit/rating-group/rating-group.svelte';

	let value = $state(3.5);
</script>

<div class="flex flex-col items-center gap-3">
	<RatingGroup bind:value allowHalf aria-label="Rating" />
	<p class="text-sm text-muted-foreground">{value || 'not rated'}</p>
</div>
