<script lang="ts">
	import CheckIcon from '@lucide/svelte/icons/check';
	import CopyIcon from '@lucide/svelte/icons/copy';
	import CopyButton from '$lib/coral/kit/copy-button/copy-button.svelte';
</script>

<CopyButton text="COP-2026-00481" variant="outline" copiedLabel="Referencia copiada">
	{#snippet children({ status })}
		{#if status === 'copied'}
			<CheckIcon data-icon="inline-start" /> Copiado
		{:else}
			<CopyIcon data-icon="inline-start" /> Copiar referencia
		{/if}
	{/snippet}
</CopyButton>
