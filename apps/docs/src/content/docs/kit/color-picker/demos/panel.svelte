<script lang="ts">
	import ColorPanel from '#lib/components/coral/kit/color-picker/color-panel.svelte';

	let value = $state('#0d9488');
	let saved = $state('#0d9488');
</script>

<!-- The panel on its own, for a settings page with room for it. `onchange` fires once per gesture,
     so it is where the save goes; `bind:value` follows every pointer move. -->
<div class="flex w-full max-w-xs flex-col gap-3">
	<ColorPanel bind:value onchange={(next) => (saved = next)} />
	<p class="text-sm text-muted-foreground">
		Live <span class="font-mono">{value}</span> · saved <span class="font-mono">{saved}</span>
	</p>
</div>
