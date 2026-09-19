<script lang="ts">
	import CheckIcon from '@lucide/svelte/icons/check';
	import CopyIcon from '@lucide/svelte/icons/copy';
	import CopyButton from '$lib/coral/kit/copy-button/copy-button.svelte';
</script>

<CopyButton text="REF-2026-00481" variant="outline" copiedLabel="Reference copied">
	{#snippet children({ status })}
		{#if status === 'copied'}
			<CheckIcon data-icon="inline-start" /> Copied
		{:else}
			<CopyIcon data-icon="inline-start" /> Copy reference
		{/if}
	{/snippet}
</CopyButton>
