<script lang="ts">
	import ColorPicker from '#lib/components/coral/kit/color-picker/color-picker.svelte';
	import * as Field from '#lib/components/ui/field/index.js';
	import ShowcaseCard from './ShowcaseCard.svelte';

	let value = $state<string | undefined>('#2563eb');
</script>

<ShowcaseCard
	title="Brand color"
	description="Used on web-app's status page and in the emails it sends."
	hint="Drag in the square, use the arrow keys, or type a hex: the value below follows live."
	components={['kit/color-picker']}
>
	<Field.Field>
		<Field.Label for="brand-color">Accent</Field.Label>
		<ColorPicker id="brand-color" bind:value placeholder="No color" />
		<Field.Description>
			Saved as <code>{value ?? 'none'}</code>
		</Field.Description>
	</Field.Field>
</ShowcaseCard>
