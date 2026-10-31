<script lang="ts">
	import NumberInput from '#lib/components/coral/kit/number-input/number-input.svelte';
	import * as Field from '#lib/components/ui/field/index.js';

	let price = $state<number | undefined>(49);
	let discount = $state<number | undefined>(0.15);
	let storage = $state<number | undefined>(20);
</script>

<div class="flex flex-col gap-4">
	<Field.Field>
		<Field.Label for="seat-price">Price per seat</Field.Label>
		<NumberInput
			id="seat-price"
			bind:value={price}
			min={0}
			format={{ style: 'currency', currency: 'USD' }}
			class="w-28"
		/>
	</Field.Field>
	<Field.Field>
		<Field.Label for="annual-discount">Annual discount</Field.Label>
		<NumberInput
			id="annual-discount"
			bind:value={discount}
			min={0}
			max={1}
			step={0.01}
			format={{ style: 'percent' }}
			class="w-28"
		/>
	</Field.Field>
	<Field.Field>
		<Field.Label for="build-storage">Build cache</Field.Label>
		<NumberInput
			id="build-storage"
			bind:value={storage}
			min={1}
			step={5}
			format={{ style: 'unit', unit: 'gigabyte' }}
			class="w-28"
		/>
	</Field.Field>
	<p class="font-mono text-xs text-muted-foreground">
		{JSON.stringify({ price, discount, storage })}
	</p>
</div>
