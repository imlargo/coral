<script lang="ts">
	import CopyButton from '$lib/coral/kit/copy-button/copy-button.svelte';
	import type { CopyStatus } from '$lib/coral/kit/copy-button/types.js';

	let status = $state<CopyStatus>('idle');

	// Stands in for a request that signs a short-lived download link.
	async function signLink() {
		await new Promise((resolve) => setTimeout(resolve, 800));
		return `https://files.ejemplo.co/d/${crypto.randomUUID()}?expires=600`;
	}
</script>

<div class="flex flex-col items-center gap-3">
	<CopyButton text={signLink} bind:status variant="outline" size="default">
		{#snippet children({ status })}
			{status === 'copying'
				? 'Generando…'
				: status === 'copied'
					? 'Enlace copiado'
					: 'Copiar enlace temporal'}
		{/snippet}
	</CopyButton>
	<p class="text-sm text-muted-foreground">Estado: {status}</p>
</div>
