<script lang="ts">
	import InlineEdit from '$lib/coral/kit/inline-edit/inline-edit.svelte';

	let name = $state('Presupuesto Q3');
</script>

<div class="flex w-72 flex-col gap-2">
	<InlineEdit
		bind:value={name}
		class="w-full text-lg font-medium"
		placeholder="Sin nombre"
		editLabel={(value) => `Renombrar ${value}`}
		required
	/>
	<p class="text-sm text-muted-foreground">Haz clic, o enfoca y pulsa F2.</p>
</div>
