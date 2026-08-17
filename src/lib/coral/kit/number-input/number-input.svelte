<script lang="ts">
	/**
	 * @coral/kit/number-input
	 * @version 1.0.0
	 */
	import MinusIcon from '@lucide/svelte/icons/minus';
	import PlusIcon from '@lucide/svelte/icons/plus';
	import * as InputGroup from '$lib/components/ui/input-group/index.js';
	import { cn } from '$lib/utils.js';
	import { decimalsOf, parse, stepValue } from './step.js';
	import type { NumberInputProps } from './types.js';

	let {
		value = $bindable(),
		min,
		max,
		step = 1,
		decimals,
		onchange,
		decrementLabel = 'Decrease',
		incrementLabel = 'Increase',
		disabled = false,
		readonly = false,
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

	function commit(next: number | undefined) {
		if (next === value) return;
		value = next;
		onchange?.(next);
	}

	function nudge(delta: number) {
		if (disabled || readonly) return;
		commit(stepValue({ value, delta, min, max, decimals: places }));
	}

	/**
	 * Reads the field on commit - blur, Enter, or a native arrow-key step - rather than on every
	 * keystroke.
	 *
	 * Clamping per keystroke fights the person typing: with a max of 100, the `1` of `150` is fine
	 * and the `15` is fine, so the value only becomes wrong once they have stopped. One project in
	 * the corpus skips this clamp entirely and lets typed entry commit values above the cap that its
	 * own steppers refuse to reach.
	 */
	function handleChange(event: Event & { currentTarget: HTMLInputElement }) {
		const field = event.currentTarget;
		const next = parse(field.value, min, max, places);

		commit(next);

		// The element keeps whatever was typed. When that text clamped to a number the value already
		// held, nothing re-renders and the field is left showing `150` over a value of `100`.
		field.value = next === undefined ? '' : String(next);
	}

	/**
	 * A focused number input steps on scroll in Chromium, so a page scrolled with the pointer over
	 * one edits it silently - the reader has no reason to look back at a field they were only
	 * scrolling past. Nothing here needs the wheel, so it never gets it.
	 */
	function handleWheel(event: WheelEvent & { currentTarget: HTMLInputElement }) {
		if (document.activeElement === event.currentTarget) event.preventDefault();
	}
</script>

<InputGroup.Root class={cn('max-w-max', groupClass)}>
	<InputGroup.Addon>
		<InputGroup.Button
			size="icon-xs"
			aria-label={decrementLabel}
			disabled={disabled || readonly || atMin}
			onclick={() => nudge(-step)}
		>
			<MinusIcon />
		</InputGroup.Button>
	</InputGroup.Addon>

	<!--
		`type="number"` for the keyboard and the semantics the browser already gives: arrow keys step,
		mobile shows a numeric keypad, and assistive tech reads it as a spinbutton. The native
		spinners are removed because this component draws its own, and two sets of steppers on one
		field is one set too many.
	-->
	<InputGroup.Input
		bind:ref
		type="number"
		inputmode={places > 0 ? 'decimal' : 'numeric'}
		{value}
		{min}
		{max}
		{step}
		{disabled}
		{readonly}
		onchange={handleChange}
		onwheel={handleWheel}
		class={cn(
			'w-16 [appearance:textfield] text-center [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none',
			className
		)}
		{...restProps}
	/>

	<InputGroup.Addon align="inline-end">
		<InputGroup.Button
			size="icon-xs"
			aria-label={incrementLabel}
			disabled={disabled || readonly || atMax}
			onclick={() => nudge(step)}
		>
			<PlusIcon />
		</InputGroup.Button>
	</InputGroup.Addon>
</InputGroup.Root>
