<script lang="ts">
	import RatingGroup from '$lib/coral/kit/rating-group/rating-group.svelte';
</script>

<!-- An average is drawn where it really is: no rounding, no half-star glyph. -->
<div class="flex flex-col gap-3">
	{#each [4.3, 3.8, 2.1, 5] as average (average)}
		<div class="flex items-center gap-3">
			<RatingGroup value={average} readonly class="[--coral-star:1rem]" />
			<span class="text-sm text-muted-foreground">{average}</span>
		</div>
	{/each}
</div>
