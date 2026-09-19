<script lang="ts">
	import ShowMore from '$lib/coral/kit/show-more/show-more.svelte';
</script>

<div class="flex w-96 flex-col gap-6 text-sm">
	<ShowMore lines={3} moreLabel="Show more" lessLabel="Show less">
		<p>
			The team shipped the second phase two weeks behind schedule after an unexpected surge in
			support tickets. QA signed off on the core test suite, but flagged the checkout flow for a
			follow-up pass before the next release. The revised timeline moves the final rollout to August
			30 and does not affect the budget. A last review from the security team is still pending
			before the feature can be turned on for everyone.
		</p>
	</ShowMore>

	<ShowMore lines={3} moreLabel="Show more" lessLabel="Show less">
		<p>A short note that fits entirely: no button shows up here.</p>
	</ShowMore>
</div>
