<script lang="ts">
	import SegmentedProgress from '#lib/components/coral/kit/segmented-progress/segmented-progress.svelte';
	import Stepper from '#lib/components/coral/kit/stepper/stepper.svelte';
	import StepperContent from '#lib/components/coral/kit/stepper/stepper-content.svelte';
	import StepperNext from '#lib/components/coral/kit/stepper/stepper-next.svelte';
	import StepperPrevious from '#lib/components/coral/kit/stepper/stepper-previous.svelte';

	const steps = ['repository', 'environment', 'domain'];
	const titles: Record<string, string> = {
		repository: 'Pick the repository to deploy.',
		environment: 'Add the environment variables it needs.',
		domain: 'Point a domain at it.'
	};
</script>

<Stepper {steps} class="w-full max-w-sm">
	{#snippet children({ value })}
		<SegmentedProgress
			count={steps.length}
			value={steps.indexOf(value) + 1}
			aria-label="New project"
		/>

		{#each steps as step (step)}
			<StepperContent {step} class="text-sm">{titles[step]}</StepperContent>
		{/each}

		<div class="flex justify-between">
			<StepperPrevious>Back</StepperPrevious>
			<StepperNext>
				{#snippet children({ isLast })}{isLast ? 'Create project' : 'Next'}{/snippet}
			</StepperNext>
		</div>
	{/snippet}
</Stepper>
