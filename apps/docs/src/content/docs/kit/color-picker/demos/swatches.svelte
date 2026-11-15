<script lang="ts">
	import ColorPicker from '#lib/components/coral/kit/color-picker/color-picker.svelte';
	import * as Field from '#lib/components/ui/field/index.js';

	let value = $state<string>();

	// Named, so a screen reader hears "Teal" rather than a hex.
	const swatches = [
		{ value: '#dc2626', label: 'Red' },
		{ value: '#ea580c', label: 'Orange' },
		{ value: '#ca8a04', label: 'Yellow' },
		{ value: '#16a34a', label: 'Green' },
		{ value: '#0d9488', label: 'Teal' },
		{ value: '#2563eb', label: 'Blue' },
		{ value: '#7c3aed', label: 'Violet' },
		{ value: '#db2777', label: 'Pink' }
	];
</script>

<Field.Field class="w-full max-w-xs">
	<Field.Label for="label-colour">Label colour</Field.Label>
	<ColorPicker id="label-colour" bind:value {swatches} placeholder="No colour" />
	<Field.Description>Shown on every issue tagged with this label.</Field.Description>
</Field.Field>
