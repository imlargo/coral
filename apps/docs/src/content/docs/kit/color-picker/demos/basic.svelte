<script lang="ts">
	import ColorPicker from '#lib/components/coral/kit/color-picker/color-picker.svelte';

	let value = $state('#2563eb');
</script>

<div class="flex flex-col items-center gap-3">
	<ColorPicker bind:value aria-label="Brand colour" />
	<p class="font-mono text-sm text-muted-foreground">{value}</p>
</div>
