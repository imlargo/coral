<script lang="ts">
	import CheckIcon from '@lucide/svelte/icons/check';
	import Stepper from '$lib/coral/kit/stepper/stepper.svelte';
	import StepperContent from '$lib/coral/kit/stepper/stepper-content.svelte';
	import StepperItem from '$lib/coral/kit/stepper/stepper-item.svelte';
	import StepperList from '$lib/coral/kit/stepper/stepper-list.svelte';
	import StepperNext from '$lib/coral/kit/stepper/stepper-next.svelte';
	import StepperPrevious from '$lib/coral/kit/stepper/stepper-previous.svelte';
	import { Badge } from '$lib/components/ui/badge/index.js';

	const steps = ['datos', 'direccion', 'confirmar'];
	const titles: Record<string, string> = {
		datos: 'Datos',
		direccion: 'Dirección',
		confirmar: 'Confirmar'
	};

	let current = $state<string>();
	let finished = $state(false);
</script>

<div class="flex w-full max-w-md flex-col gap-4">
	<Stepper {steps} bind:value={current} onfinish={() => (finished = true)}>
		<StepperList aria-label="Pasos del registro">
			{#each steps as step, index (step)}
				<StepperItem {step}>
					{#snippet children({ state })}
						<Badge variant={state === 'upcoming' ? 'outline' : 'default'}>
							{#if state === 'complete'}<CheckIcon />{:else}{index + 1}{/if}
						</Badge>
						<span class="text-sm">{titles[step]}</span>
					{/snippet}
				</StepperItem>
			{/each}
		</StepperList>

		{#each steps as step (step)}
			<StepperContent {step} class="rounded-lg border p-4 text-sm">
				Contenido del paso «{titles[step]}».
			</StepperContent>
		{/each}

		<div class="flex justify-between">
			<StepperPrevious>Atrás</StepperPrevious>
			<StepperNext>
				{#snippet children({ isLast })}{isLast ? 'Terminar' : 'Siguiente'}{/snippet}
			</StepperNext>
		</div>
	</Stepper>

	{#if finished}<p class="text-sm text-muted-foreground" role="status">Registro completo.</p>{/if}
</div>
