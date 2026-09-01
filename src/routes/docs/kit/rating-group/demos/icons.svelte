<script lang="ts">
	import BoneIcon from '@lucide/svelte/icons/bone';
	import SkullIcon from '@lucide/svelte/icons/skull';
	import RatingGroup from '$lib/coral/kit/rating-group/rating-group.svelte';

	let value = $state(2);
</script>

<!--
	One snippet, drawn twice per star: once as the track with `fill: 0`, once clipped to the real
	fill. Two different glyphs still get half steps for free.
-->
<RatingGroup bind:value count={3} allowHalf aria-label="Peligro">
	{#snippet star({ fill })}
		{#if fill > 0}
			<SkullIcon class="size-full" />
		{:else}
			<BoneIcon class="size-full" />
		{/if}
	{/snippet}
</RatingGroup>
