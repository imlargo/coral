<script lang="ts">
	import InlineEdit from '$lib/coral/kit/inline-edit/inline-edit.svelte';

	let name = $state('api-gateway');
</script>

<div class="flex w-72 flex-col gap-2">
	<InlineEdit
		bind:value={name}
		class="w-full text-lg font-medium"
		placeholder="No name"
		editLabel={(value) => `Rename ${value}`}
		required
	/>
	<p class="text-sm text-muted-foreground">Click, or focus and press F2.</p>
</div>
