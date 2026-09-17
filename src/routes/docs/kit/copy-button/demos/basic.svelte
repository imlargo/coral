<script lang="ts">
	import CopyButton from '$lib/coral/kit/copy-button/copy-button.svelte';

	const invite = 'https://app.ejemplo.co/invitacion/7f3a9c';
</script>

<div class="flex items-center gap-2 rounded-lg border py-1 ps-3 pe-1">
	<code class="text-sm">{invite}</code>
	<CopyButton text={invite} label="Copiar enlace" copiedLabel="Enlace copiado" />
</div>
