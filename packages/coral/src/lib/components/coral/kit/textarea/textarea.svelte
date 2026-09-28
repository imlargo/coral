<script lang="ts">
	/**
	 * @coral/kit/textarea
	 * @version 1.0.0
	 */
	import { Textarea } from '$lib/components/ui/textarea/index.js';
	import { cn } from '$lib/utils.js';
	import LiveRegion from '../../lib/live-region.svelte';
	import { countOf, heightFor, remaining } from './measure.js';
	import type { TextareaProps } from './types.js';

	let {
		value = $bindable(''),
		rows = 2,
		maxRows,
		maxLength,
		showCount = false,
		warnAt,
		submitOn = false,
		onsubmit,
		id,
		class: className,
		ref = $bindable(null),
		oninput,
		onkeydown,
		counter,
		...restProps
	}: TextareaProps = $props();

	const uid = $props.id();
	const fieldId = $derived(id ?? `${uid}-field`);
	const countId = `${uid}-count`;

	const count = $derived(countOf(value ?? ''));
	const left = $derived(maxLength === undefined ? 0 : remaining(value ?? '', maxLength));
	/** The last tenth of the allowance, unless the caller says otherwise. */
	const threshold = $derived(warnAt ?? (maxLength === undefined ? 0 : Math.ceil(maxLength / 10)));
	const warning = $derived(maxLength !== undefined && left <= threshold);
	const showCounter = $derived((showCount || counter !== undefined) && maxLength !== undefined);

	let scrollable = $state(false);

	/**
	 * Sets the height to fit the text.
	 *
	 * The measurement needs the element unconstrained for an instant, and that instant is where the
	 * page jumps: a field being shrunk reports a smaller content height, the document gets shorter,
	 * and a browser that was scrolled near the bottom scrolls up under the reader. Capturing the
	 * scroll position across the measurement is what keeps typing from moving the page.
	 */
	function resize() {
		if (!ref) return;

		const scroller = document.scrollingElement ?? document.documentElement;
		const scrollTop = scroller.scrollTop;
		const style = getComputedStyle(ref);

		ref.style.height = 'auto';
		const { height, scrollable: overflowing } = heightFor({
			scrollHeight: ref.scrollHeight,
			// A `line-height` of `normal` has no number to read, so it is taken from the font size at
			// the ratio browsers use for it.
			lineHeight: Number.parseFloat(style.lineHeight) || Number.parseFloat(style.fontSize) * 1.2,
			padding: Number.parseFloat(style.paddingTop) + Number.parseFloat(style.paddingBottom),
			border: Number.parseFloat(style.borderTopWidth) + Number.parseFloat(style.borderBottomWidth),
			borderBox: style.boxSizing === 'border-box',
			minRows: rows,
			maxRows
		});

		ref.style.height = `${height}px`;
		scrollable = overflowing;
		scroller.scrollTop = scrollTop;
	}

	/**
	 * Re-measured whenever the text changes, and whenever the field's own width does: a narrower
	 * field rewraps its text into more lines, which is a height change nobody typed.
	 */
	$effect(() => {
		void value;
		void rows;
		void maxRows;
		if (!ref) return;

		resize();
		const observer = new ResizeObserver(resize);
		observer.observe(ref);
		return () => observer.disconnect();
	});

	/**
	 * A web font landing after the first paint changes the line height under a field already sized
	 * for the fallback, which leaves it a line short until the next keystroke.
	 */
	$effect(() => {
		let cancelled = false;
		document.fonts?.ready.then(() => {
			if (!cancelled) resize();
		});
		return () => (cancelled = true);
	});

	function handleKeydown(event: KeyboardEvent & { currentTarget: HTMLTextAreaElement }) {
		onkeydown?.(event);
		if (!submitOn || !onsubmit || event.defaultPrevented) return;
		// Mid-composition, Enter is how an input method accepts what it is suggesting, not a send.
		if (event.key !== 'Enter' || event.isComposing) return;

		const modified = event.metaKey || event.ctrlKey;
		const wanted = submitOn === 'mod-enter' ? modified : !event.shiftKey && !modified;
		if (!wanted) return;

		// An empty field submits nothing, so Enter is left to do what it normally does.
		const text = (value ?? '').trim();
		if (text === '') return;

		event.preventDefault();
		onsubmit(value ?? '');
	}
</script>

<div class="flex w-full flex-col gap-1.5">
	<!--
		Two things are switched off deliberately. `field-sizing: content` grows a textarea natively and
		is the right answer the day every engine has it; today it is not, so a field would grow in one
		browser and not in another, and it cannot express `maxRows` in lines without knowing the
		padding. `min-h-16` is the theme's floor, which would quietly outrank a `rows` of 1 or 2 - and
		`rows` is this component's contract.

		`overflow-hidden` while the text fits keeps a scrollbar from flashing on every grow, and is
		lifted the moment `maxRows` caps the field.
	-->
	<Textarea
		bind:ref={() => ref, (node) => (ref = node as HTMLTextAreaElement | null)}
		bind:value
		id={fieldId}
		{rows}
		data-scrollable={scrollable || undefined}
		maxlength={maxLength}
		aria-describedby={showCounter ? countId : undefined}
		class={cn(
			'field-sizing-fixed min-h-0 resize-none',
			scrollable ? 'overflow-y-auto' : 'overflow-hidden',
			className
		)}
		oninput={(event) => {
			// Measured on the way in, before the caller hears about it: a handler that reads the
			// element's height should read the one it will have.
			resize();
			oninput?.(event);
		}}
		onkeydown={handleKeydown}
		{...restProps}
	/>

	{#if showCounter && maxLength !== undefined}
		{@const context = { count, left, limit: maxLength, warning }}
		<div id={countId} class="flex justify-end text-xs text-muted-foreground">
			{#if counter}
				{@render counter(context)}
			{:else}
				<span data-warning={warning || undefined} class="data-warning:text-destructive">
					{count}/{maxLength}
				</span>
			{/if}
		</div>

		<!--
			Announced only near the limit, and only as the number left. A counter that speaks on every
			keystroke makes the field unusable with a screen reader on.
		-->
		<LiveRegion message={warning ? `${left} characters left` : ''} />
	{/if}
</div>
