<script lang="ts">
	/**
	 * @coral/kit/number-input
	 * @version 2.0.0
	 */
	import MinusIcon from '@lucide/svelte/icons/minus';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import * as InputGroup from '#lib/components/ui/input-group/index.js';
	import { cn } from '#lib/utils.js';
	import HiddenField from '../../lib/hidden-field.svelte';
	import { decimalsOf } from '../../lib/number.js';
	import { numberField, numberFieldClass } from '../../lib/number-field.js';
	import type { NumberInputProps } from './types.js';

	let {
		value = $bindable(),
		min,
		max,
		step = 1,
		largeStep,
		decimals,
		locale = 'en-US',
		onchange,
		decrementLabel = 'Decrease',
		incrementLabel = 'Increase',
		disabled = false,
		readonly = false,
		name,
		form,
		class: className,
		groupClass,
		ref = $bindable(null),
		...restProps
	}: NumberInputProps = $props();

	const places = $derived(decimals ?? decimalsOf(step));

	/**
	 * A stepper is only spent once the value is actually against its bound. An empty field leaves
	 * both live, because stepping from empty has somewhere to go in either direction.
	 */
	const atMin = $derived(min !== undefined && value !== undefined && value <= min);
	const atMax = $derived(max !== undefined && value !== undefined && value >= max);

	const field = numberField({
		value: () => value,
		set: (next) => (value = next),
		min: () => min,
		max: () => max,
		step: () => step,
		largeStep: () => largeStep ?? step * 10,
		decimals: () => places,
		locale: () => locale,
		editable: () => !disabled && !readonly,
		onchange: () => onchange
	});
</script>

<InputGroup.Root class={cn('max-w-max', groupClass)}>
	<InputGroup.Addon>
		<InputGroup.Button
			size="icon-sm"
			aria-label={decrementLabel}
			disabled={disabled || readonly || atMin}
			onclick={() => field.nudge(-step)}
		>
			<MinusIcon />
		</InputGroup.Button>
	</InputGroup.Addon>

	<!-- A text field announced as a spinbutton, so it reads `1,5` the way `locale` writes it: see
	     `lib/number-field`. -->
	<InputGroup.Input
		bind:ref
		{...field.attributes()}
		{disabled}
		{readonly}
		onchange={field.change}
		onkeydown={field.keydown}
		class={cn(numberFieldClass, className)}
		{...restProps}
	/>

	<InputGroup.Addon align="inline-end">
		<InputGroup.Button
			size="icon-sm"
			aria-label={incrementLabel}
			disabled={disabled || readonly || atMax}
			onclick={() => field.nudge(step)}
		>
			<PlusIcon />
		</InputGroup.Button>
	</InputGroup.Addon>
</InputGroup.Root>

<!-- What a form submits is the number, `1.5`, not the text the reader sees, which may be `1,5`. -->
{#if name && !disabled}
	<HiddenField {name} {form} value={value === undefined ? '' : String(value)} />
{/if}
