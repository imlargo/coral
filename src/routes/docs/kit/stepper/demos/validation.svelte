<script lang="ts">
	import Stepper from '$lib/coral/kit/stepper/stepper.svelte';
	import StepperContent from '$lib/coral/kit/stepper/stepper-content.svelte';
	import StepperItem from '$lib/coral/kit/stepper/stepper-item.svelte';
	import StepperList from '$lib/coral/kit/stepper/stepper-list.svelte';
	import StepperNext from '$lib/coral/kit/stepper/stepper-next.svelte';
	import StepperPrevious from '$lib/coral/kit/stepper/stepper-previous.svelte';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';

	const steps = ['empresa', 'pago', 'resumen'] as const;
	type Step = (typeof steps)[number];
	const titles: Record<Step, string> = { empresa: 'Empresa', pago: 'Pago', resumen: 'Resumen' };

	let nit = $state('');
	let error = $state('');

	// Simulates checking the tax id against a server before letting the reader move on.
	async function beforeNext(step: Step) {
		error = '';
		if (step !== 'empresa') return;
		await new Promise((resolve) => setTimeout(resolve, 700));
		if (!/^\d{9}$/.test(nit)) {
			error = 'El NIT debe tener 9 dígitos.';
			return false;
		}
	}
</script>

<div class="flex w-full max-w-md flex-col gap-4">
	<Stepper {steps} onbeforenext={beforeNext}>
		<StepperList aria-label="Alta de empresa">
			{#each steps as step, index (step)}
				<StepperItem {step} class="rounded-md px-2 py-1 data-[state=current]:bg-muted">
					<span class="text-sm">{index + 1}. {titles[step]}</span>
				</StepperItem>
			{/each}
		</StepperList>

		<StepperContent step="empresa" class="flex flex-col gap-2">
			<Label for="nit">NIT</Label>
			<Input
				id="nit"
				bind:value={nit}
				inputmode="numeric"
				aria-invalid={error ? 'true' : undefined}
			/>
			<p class="text-sm text-muted-foreground" role="status">{error || 'Prueba con 123.'}</p>
		</StepperContent>
		<StepperContent step="pago" class="text-sm">Método de pago.</StepperContent>
		<StepperContent step="resumen" class="text-sm">Todo listo.</StepperContent>

		<div class="flex justify-between">
			<StepperPrevious>Atrás</StepperPrevious>
			<StepperNext>
				{#snippet children({ isLast, pending })}
					{pending ? 'Validando…' : isLast ? 'Crear empresa' : 'Siguiente'}
				{/snippet}
			</StepperNext>
		</div>
	</Stepper>
</div>
