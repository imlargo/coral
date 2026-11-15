<script lang="ts">
	import NumberInput from '#lib/components/coral/kit/number-input/number-input.svelte';
	import ScrubInput from '#lib/components/coral/kit/scrub-input/scrub-input.svelte';
	import * as Field from '#lib/components/ui/field/index.js';
	import ShowcaseCard from './ShowcaseCard.svelte';

	let replicas = $state<number | undefined>(3);
	let memoryMb = $state<number | undefined>(512);
	let spendLimit = $state<number | undefined>(250);
</script>

<ShowcaseCard
	title="Scaling"
	description="How many copies of web-app run in Production, and what they may cost."
	hint="Drag the Memory label, or use the arrow keys with Shift for bigger steps. Try typing 20 replicas."
	components={['kit/number-input', 'kit/scrub-input']}
>
	<Field.Field>
		<Field.Label for="scaling-replicas">Replicas</Field.Label>
		<NumberInput id="scaling-replicas" bind:value={replicas} min={1} max={10} />
	</Field.Field>

	<ScrubInput label="Memory" bind:value={memoryMb} min={128} max={8192} step={128} suffix="MB" />

	<Field.Field>
		<Field.Label for="scaling-spend">Monthly spend limit</Field.Label>
		<NumberInput
			id="scaling-spend"
			bind:value={spendLimit}
			min={0}
			step={10}
			decimals={0}
			format={{ style: 'currency', currency: 'USD', maximumFractionDigits: 0 }}
		/>
	</Field.Field>

	<p class="font-mono text-xs break-all text-muted-foreground">
		{JSON.stringify({ replicas, memoryMb, spendLimit })}
	</p>
</ShowcaseCard>
