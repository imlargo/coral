<script lang="ts">
	import ShowMore from '$lib/coral/kit/show-more/show-more.svelte';
	import { Button } from '$lib/components/ui/button/index.js';

	let expanded = $state(false);
</script>

<div class="w-96 text-sm">
	<ShowMore lines={4} bind:expanded>
		<p class="mb-2">What's new in version 2.4:</p>
		<ul class="list-disc ps-5">
			<li>Export reports to Excel.</li>
			<li>Saved filters per user.</li>
			<li>Electronic signatures on purchase orders.</li>
			<li>Configurable email notifications.</li>
			<li><a class="underline" href="#main-content">View full changelog</a></li>
		</ul>

		{#snippet toggle({ props, expanded })}
			<Button {...props} variant="outline" size="sm">
				{expanded ? 'Hide changelog' : 'View changelog'}
			</Button>
		{/snippet}
	</ShowMore>
	<p class="mt-2 text-muted-foreground">Tabbing to the hidden link also expands it.</p>
</div>
