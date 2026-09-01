<script lang="ts">
	/**
	 * @coral/kit/rating-group
	 * @version 1.0.0
	 */
	import StarIcon from '@lucide/svelte/icons/star';
	import { cn } from '$lib/utils.js';
	import { fillOf, snap, stepsFor } from './rating.js';
	import type { RatingGroupProps } from './types.js';

	let {
		value = $bindable(0),
		count = 5,
		allowHalf = false,
		readonly = false,
		disabled = false,
		required = false,
		name,
		form,
		locale = 'es-CO',
		color = 'var(--primary)',
		emptyColor = 'var(--muted-foreground)',
		label,
		onchange,
		onhover,
		ref = $bindable(null),
		class: className,
		starClass,
		star,
		...restProps
	}: RatingGroupProps = $props();

	const stars = $derived(Math.max(0, Math.floor(count)));

	/** What can be picked, as opposed to what is drawn - see `snap`. */
	const checked = $derived(snap(value, stars, allowHalf));

	let hovered = $state<number | null>(null);

	/**
	 * The rating on screen right now.
	 *
	 * `readonly` draws `value` untouched, so an average lands where it really is. Everywhere else
	 * draws the step that is actually selected, because a control has to show what it would submit.
	 */
	const shown = $derived(hovered ?? (readonly ? value : checked));

	const number = $derived(new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }));
	const labelFor = $derived(
		label ?? ((rating: number, total: number) => `${number.format(rating)} / ${total}`)
	);

	/**
	 * Radios group by `name`, so one is needed whether or not a form is involved: without it every
	 * star is its own group of one, arrow keys do nothing and several can be checked at once.
	 *
	 * A generated name would then be posted under a meaningless key, so a control the caller did
	 * not name is pointed at a form that does not exist. A null form owner is not submitted, which
	 * leaves `name` meaning exactly one thing: this rating goes in the request.
	 */
	const uid = $props.id();
	const group = $derived(name ?? `${uid}-group`);
	const owner = $derived(name ? form : `${uid}-detached`);

	/**
	 * The ratings that live inside one star, and so the hit areas it is divided into.
	 *
	 * The steps of a one-star rating are exactly those offsets - `[1]`, or `[0.5, 1]` - which keeps
	 * the halves from being a second, hand-written description of the same rule.
	 */
	const offsets = $derived(stepsFor(1, allowHalf));

	function pick(rating: number) {
		if (rating === value) return;
		value = rating;
		onchange?.(rating);
	}

	function hover(rating: number | null) {
		if (rating === hovered) return;
		hovered = rating;
		onhover?.(rating);
	}

	/**
	 * `Home` and `End`, which a native radio group leaves out.
	 *
	 * Everything else the arrow keys do is the browser's, and this is the one gap worth closing:
	 * with half steps a group is ten options wide, and walking to either end of it one arrow at a
	 * time is the kind of thing the shortcut exists for. Handled on the radio rather than on the
	 * group, so it hangs off something that was already interactive.
	 */
	function jump(event: KeyboardEvent) {
		const to = event.key === 'Home' ? offsets[0] : event.key === 'End' ? stars : null;
		if (to === null || disabled) return;

		event.preventDefault();
		pick(to);
		ref?.querySelector<HTMLInputElement>(`input[value="${to}"]`)?.focus();
	}
</script>

{#snippet glyph(index: number, fill: number)}
	{#if star}
		{@render star({ index, fill })}
	{:else}
		<StarIcon class="size-full" fill={fill > 0 ? 'currentColor' : 'none'} />
	{/if}
{/snippet}

<!--
	One star, drawn as two stacked copies of the same glyph: the track underneath, and a filled copy
	clipped to how much of it is earned. Clipping rather than swapping in a half-star glyph is what
	lets a custom shape - and any fraction, not just a half - work without a second icon.
-->
{#snippet unit(index: number)}
	{@const fill = fillOf(shown, index)}
	<span
		class={cn(
			'relative block size-(--coral-star) shrink-0 outline-offset-2 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-ring',
			starClass
		)}
	>
		<span class="block size-(--coral-star)" style="color: {emptyColor}">
			{@render glyph(index, 0)}
		</span>

		{#if fill > 0}
			<span
				class="absolute inset-y-0 start-0 overflow-hidden"
				style="inline-size: {fill * 100}%; color: {color}"
			>
				<!-- Full size inside a narrower box: the box does the clipping, so the glyph is never
				     squashed, and in a right-to-left page it overflows the other way on its own. -->
				<span class="block size-(--coral-star)">
					{@render glyph(index, fill)}
				</span>
			</span>
		{/if}

		{#if !readonly}
			{#each offsets as offset, slot (offset)}
				{@const rating = index + offset}
				<label
					class={cn('absolute inset-y-0', disabled ? 'cursor-default' : 'cursor-pointer')}
					style="inset-inline-start: {(slot * 100) / offsets.length}%; inline-size: {100 /
						offsets.length}%"
					onpointerenter={() => !disabled && hover(rating)}
				>
					<!-- `sr-only`, not `hidden`: it stays focusable, so the group keeps every bit of
					     keyboard and form behaviour the platform already gives a radio. -->
					<input
						class="sr-only"
						type="radio"
						name={group}
						form={owner}
						value={rating}
						checked={checked === rating}
						{disabled}
						{required}
						aria-label={labelFor(rating, stars)}
						onchange={() => pick(rating)}
						onkeydown={jump}
					/>
				</label>
			{/each}
		{/if}
	</span>
{/snippet}

<div
	bind:this={ref}
	role={readonly ? 'img' : 'radiogroup'}
	aria-label={readonly ? labelFor(value, stars) : undefined}
	aria-readonly={readonly ? 'true' : undefined}
	data-disabled={disabled || undefined}
	class={cn(
		'flex w-fit items-center gap-1 [--coral-star:1.25rem]',
		'data-disabled:pointer-events-none data-disabled:opacity-50',
		className
	)}
	onpointerleave={() => hover(null)}
	{...restProps}
>
	{#each { length: stars }, index (index)}
		{@render unit(index)}
	{/each}
</div>
