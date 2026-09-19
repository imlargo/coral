<script lang="ts">
	import ShowMore from '$lib/coral/kit/show-more/show-more.svelte';
</script>

<div class="flex w-96 flex-col gap-6 text-sm">
	<ShowMore lines={3} moreLabel="Show more" lessLabel="Show less">
		<p>
			Between 09:14 and 10:02 UTC, around 8% of builds in the Production environment failed with a
			503 from the artifact store. The cause was a connection pool that was never resized after last
			week's database upgrade. Builds queued during the window were replayed automatically once the
			pool was widened, so no deployment was lost. Adding a pool-size check to the upgrade checklist
			is tracked as a follow-up on the incident review.
		</p>
	</ShowMore>

	<ShowMore lines={3} moreLabel="Show more" lessLabel="Show less">
		<p>A short note that fits entirely: no button shows up here.</p>
	</ShowMore>
</div>
