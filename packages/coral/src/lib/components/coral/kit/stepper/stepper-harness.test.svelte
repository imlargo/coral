<script lang="ts">
	/**
	 * @coral/kit/stepper
	 * @version 1.0.0
	 */
	import Stepper from './stepper.svelte';
	import StepperContent from './stepper-content.svelte';
	import StepperItem from './stepper-item.svelte';
	import StepperList from './stepper-list.svelte';
	import StepperNext from './stepper-next.svelte';
	import StepperPrevious from './stepper-previous.svelte';

	let {
		steps,
		value = $bindable(),
		completed = $bindable([]),
		keepMounted = false,
		nextLabel,
		finishLabel,
		previousLabel,
		...restProps
	}: {
		steps: string[];
		value?: string;
		completed?: string[];
		keepMounted?: boolean;
		nextLabel?: string;
		finishLabel?: string;
		previousLabel?: string;
		[key: string]: unknown;
	} = $props();
</script>

<Stepper {steps} bind:value bind:completed {...restProps}>
	<StepperList>
		{#each steps as step (step)}
			<StepperItem {step}>
				{#snippet children({ index })}{index + 1}. {step}{/snippet}
			</StepperItem>
		{/each}
	</StepperList>

	{#each steps as step (step)}
		<StepperContent {step} {keepMounted}>{step}</StepperContent>
	{/each}

	<div>
		<StepperPrevious label={previousLabel} />
		<StepperNext {nextLabel} {finishLabel} />
	</div>
</Stepper>
