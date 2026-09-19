<script lang="ts">
	import Stepper from '$lib/coral/kit/stepper/stepper.svelte';
	import StepperContent from '$lib/coral/kit/stepper/stepper-content.svelte';
	import StepperItem from '$lib/coral/kit/stepper/stepper-item.svelte';
	import StepperList from '$lib/coral/kit/stepper/stepper-list.svelte';
	import StepperNext from '$lib/coral/kit/stepper/stepper-next.svelte';
	import StepperPrevious from '$lib/coral/kit/stepper/stepper-previous.svelte';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';

	const steps = ['company', 'payment', 'summary'] as const;
	type Step = (typeof steps)[number];
	const titles: Record<Step, string> = {
		company: 'Company',
		payment: 'Payment',
		summary: 'Summary'
	};

	let taxId = $state('');
	let error = $state('');

	// Simulates checking the tax id against a server before letting the reader move on.
	async function beforeNext(step: Step) {
		error = '';
		if (step !== 'company') return;
		await new Promise((resolve) => setTimeout(resolve, 700));
		if (!/^\d{9}$/.test(taxId)) {
			error = 'Tax ID must be 9 digits.';
			return false;
		}
	}
</script>

<div class="flex w-full max-w-md flex-col gap-4">
	<Stepper {steps} onbeforenext={beforeNext}>
		<StepperList aria-label="New company setup">
			{#each steps as step, index (step)}
				<StepperItem {step} class="rounded-md px-2 py-1 data-[state=current]:bg-muted">
					<span class="text-sm">{index + 1}. {titles[step]}</span>
				</StepperItem>
			{/each}
		</StepperList>

		<StepperContent step="company" class="flex flex-col gap-2">
			<Label for="taxId">Tax ID</Label>
			<Input
				id="taxId"
				bind:value={taxId}
				inputmode="numeric"
				aria-invalid={error ? 'true' : undefined}
			/>
			<p class="text-sm text-muted-foreground" role="status">{error || 'Try 123.'}</p>
		</StepperContent>
		<StepperContent step="payment" class="text-sm">Payment method.</StepperContent>
		<StepperContent step="summary" class="text-sm">All set.</StepperContent>

		<div class="flex justify-between">
			<StepperPrevious>Back</StepperPrevious>
			<StepperNext>
				{#snippet children({ isLast, pending })}
					{pending ? 'Validating…' : isLast ? 'Create company' : 'Next'}
				{/snippet}
			</StepperNext>
		</div>
	</Stepper>
</div>
