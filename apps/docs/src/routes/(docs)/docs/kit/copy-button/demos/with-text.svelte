<script lang="ts">
	import CheckIcon from '@lucide/svelte/icons/check';
	import CopyIcon from '@lucide/svelte/icons/copy';
	import CopyButton from '$lib/components/coral/kit/copy-button/copy-button.svelte';
</script>

<CopyButton text="9f2c1ab3d84e7c05" variant="outline" copiedLabel="Commit SHA copied">
	{#snippet children({ status })}
		{#if status === 'copied'}
			<CheckIcon data-icon="inline-start" /> Copied
		{:else}
			<CopyIcon data-icon="inline-start" /> Copy commit SHA
		{/if}
	{/snippet}
</CopyButton>
