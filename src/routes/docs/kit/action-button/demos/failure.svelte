<script lang="ts">
	import ActionButton from '$lib/coral/kit/action-button/action-button.svelte';

	let attempts = 0;
	let message = $state('');

	async function sync() {
		attempts++;
		await new Promise((resolve) => setTimeout(resolve, 800));
		if (attempts % 2 === 1) throw new Error('El servidor no respondió');
	}
</script>

<div class="flex flex-col items-center gap-3">
	<ActionButton
		variant="outline"
		onclick={sync}
		onsuccess={() => (message = 'Sincronizado.')}
		onerror={(error) => (message = `Error: ${(error as Error).message}. Intenta de nuevo.`)}
	>
		Sincronizar
	</ActionButton>
	<p class="text-sm text-muted-foreground" role="status">{message}</p>
</div>
