<script lang="ts">
	import Stepper from '$lib/components/coral/kit/stepper/stepper.svelte';
	import StepperContent from '$lib/components/coral/kit/stepper/stepper-content.svelte';
	import StepperItem from '$lib/components/coral/kit/stepper/stepper-item.svelte';
	import StepperList from '$lib/components/coral/kit/stepper/stepper-list.svelte';
	import StepperNext from '$lib/components/coral/kit/stepper/stepper-next.svelte';
	import StepperPrevious from '$lib/components/coral/kit/stepper/stepper-previous.svelte';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';

	const steps = ['project', 'environment', 'review'] as const;
	type Step = (typeof steps)[number];
	const titles: Record<Step, string> = {
		project: 'Project',
		environment: 'Environment',
		review: 'Review'
	};

	let slug = $state('');
	let error = $state('');

	// Simulates checking the slug against a server before letting the reader move on.
	async function beforeNext(step: Step) {
		error = '';
		if (step !== 'project') return;
		await new Promise((resolve) => setTimeout(resolve, 700));
		if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug)) {
			error = 'Use lowercase letters, numbers and hyphens.';
			return false;
		}
	}
</script>

<div class="flex w-full max-w-md flex-col gap-4">
	<Stepper {steps} onbeforenext={beforeNext}>
		<StepperList aria-label="New project setup">
			{#each steps as step, index (step)}
				<StepperItem {step} class="rounded-md px-2 py-1 data-[state=current]:bg-muted">
					<span class="text-sm">{index + 1}. {titles[step]}</span>
				</StepperItem>
			{/each}
		</StepperList>

		<StepperContent step="project" class="flex flex-col gap-2">
			<Label for="slug">Project slug</Label>
			<Input id="slug" bind:value={slug} aria-invalid={error ? 'true' : undefined} />
			<p class="text-sm text-muted-foreground" role="status">{error || 'Try «My Service».'}</p>
		</StepperContent>
		<StepperContent step="environment" class="text-sm">Production or preview.</StepperContent>
		<StepperContent step="review" class="text-sm">All set.</StepperContent>

		<div class="flex justify-between">
			<StepperPrevious>Back</StepperPrevious>
			<StepperNext>
				{#snippet children({ isLast, pending })}
					{pending ? 'Validating…' : isLast ? 'Create project' : 'Next'}
				{/snippet}
			</StepperNext>
		</div>
	</Stepper>
</div>
