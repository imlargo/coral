<script lang="ts">
	import CheckIcon from '@lucide/svelte/icons/check';
	import Select from '#lib/components/coral/kit/select/select.svelte';
	import Stepper from '#lib/components/coral/kit/stepper/stepper.svelte';
	import StepperContent from '#lib/components/coral/kit/stepper/stepper-content.svelte';
	import StepperItem from '#lib/components/coral/kit/stepper/stepper-item.svelte';
	import StepperList from '#lib/components/coral/kit/stepper/stepper-list.svelte';
	import StepperNext from '#lib/components/coral/kit/stepper/stepper-next.svelte';
	import StepperPrevious from '#lib/components/coral/kit/stepper/stepper-previous.svelte';
	import { Badge } from '#lib/components/ui/badge/index.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Label } from '#lib/components/ui/label/index.js';
	import { REGIONS, REPOSITORIES, wait } from '#lib/features/home/world.js';
	import ShowcaseCard from './ShowcaseCard.svelte';

	const steps = ['repository', 'region', 'deploy'] as const;
	type Step = (typeof steps)[number];
	const titles: Record<Step, string> = {
		repository: 'Repository',
		region: 'Region',
		deploy: 'Deploy'
	};

	const repositories = REPOSITORIES.map((name) => ({ value: name, label: name }));

	let repository = $state<string>();
	let region = $state<string>();
	let error = $state('');
	let done = $state('');
	let attempts = 0;

	const regionLabel = $derived(REGIONS.find((option) => option.value === region)?.label);

	// Connecting fails the first time and goes through on the retry, so the step has to hold.
	async function beforeNext(step: Step) {
		error = '';
		if (step === 'repository') {
			if (!repository) {
				error = 'Pick a repository first.';
				return false;
			}
			attempts++;
			await wait(800);
			if (attempts === 1) throw new Error(`GitHub timed out while reading ${repository}.`);
		}
		if (step === 'region' && !region) {
			error = 'Pick a region first.';
			return false;
		}
	}

	async function finish() {
		await wait(900);
		done = `${repository} is building in ${regionLabel}.`;
	}

	function reset() {
		repository = undefined;
		region = undefined;
		error = '';
		done = '';
		attempts = 0;
	}
</script>

<ShowcaseCard
	title="New project"
	description="Connect a repository, pick where it runs, and ship the first deployment."
	hint="Press Next with nothing picked, then pick a repository: connecting fails once and the step holds until the retry goes through."
	components={['kit/stepper', 'kit/select']}
>
	{#if done}
		<div class="flex flex-wrap items-center justify-between gap-2">
			<p class="min-w-0 text-sm text-muted-foreground" role="status">{done}</p>
			<Button variant="outline" size="sm" onclick={reset}>Set up another</Button>
		</div>
	{:else}
		<Stepper
			{steps}
			linear
			onbeforenext={beforeNext}
			onfinish={finish}
			onerror={(reason) => (error = `${(reason as Error).message} Try again.`)}
			onvaluechange={() => (error = '')}
			class="flex min-w-0 flex-col gap-4"
		>
			<StepperList aria-label="New project setup" class="flex flex-wrap gap-x-3 gap-y-2">
				{#each steps as step, index (step)}
					<StepperItem {step} class="flex items-center gap-2">
						{#snippet children({ state })}
							<Badge variant={state === 'upcoming' ? 'outline' : 'default'}>
								{#if state === 'complete'}<CheckIcon />{:else}{index + 1}{/if}
							</Badge>
							<span class="text-sm">{titles[step]}</span>
						{/snippet}
					</StepperItem>
				{/each}
			</StepperList>

			<StepperContent step="repository" class="grid gap-2">
				<Label for="home-onboarding-repository">Repository</Label>
				<Select
					id="home-onboarding-repository"
					options={repositories}
					bind:value={repository}
					placeholder="Pick a repository"
				/>
			</StepperContent>
			<StepperContent step="region" class="grid gap-2">
				<Label for="home-onboarding-region">Region</Label>
				<Select
					id="home-onboarding-region"
					options={REGIONS}
					bind:value={region}
					placeholder="Pick a region"
				/>
			</StepperContent>
			<StepperContent step="deploy" class="text-sm text-muted-foreground">
				Builds the default branch of {repository} and serves it from {regionLabel}.
			</StepperContent>

			<p
				class={error ? 'min-w-0 text-sm text-destructive' : 'min-w-0 text-sm text-muted-foreground'}
				role="status"
			>
				{error}
			</p>

			<div class="flex justify-between gap-2">
				<StepperPrevious size="sm">Back</StepperPrevious>
				<StepperNext size="sm">
					{#snippet children({ isLast, pending })}
						{pending ? (isLast ? 'Deploying...' : 'Connecting...') : isLast ? 'Deploy' : 'Next'}
					{/snippet}
				</StepperNext>
			</div>
		</Stepper>
	{/if}
</ShowcaseCard>
