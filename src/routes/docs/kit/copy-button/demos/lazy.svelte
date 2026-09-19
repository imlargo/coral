<script lang="ts">
	import CopyButton from '$lib/coral/kit/copy-button/copy-button.svelte';
	import type { CopyStatus } from '$lib/coral/kit/copy-button/types.js';

	let status = $state<CopyStatus>('idle');

	// Stands in for a request that signs a short-lived download link.
	async function signLink() {
		await new Promise((resolve) => setTimeout(resolve, 800));
		return `https://files.example.com/d/${crypto.randomUUID()}?expires=600`;
	}
</script>

<div class="flex flex-col items-center gap-3">
	<CopyButton text={signLink} bind:status variant="outline" size="default">
		{#snippet children({ status })}
			{status === 'copying'
				? 'Generating…'
				: status === 'copied'
					? 'Link copied'
					: 'Copy temporary link'}
		{/snippet}
	</CopyButton>
	<p class="text-sm text-muted-foreground">Status: {status}</p>
</div>
