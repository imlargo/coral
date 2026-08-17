<script lang="ts">
	import ConfirmDialog from '$lib/coral/kit/confirm-dialog/confirm-dialog.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
</script>

<ConfirmDialog
	title="Sesión actualizada"
	description="Tus permisos cambiaron. Algunas secciones pueden verse distintas."
	confirmLabel="Entendido"
	showCancel={false}
>
	{#snippet trigger({ props })}
		<Button {...props} variant="outline">Ver aviso</Button>
	{/snippet}
</ConfirmDialog>
