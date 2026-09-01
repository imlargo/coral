<script lang="ts" generics="T = unknown">
	/**
	 * @coral/kit/activity-calendar
	 * @version 1.0.0
	 */
	import * as Tooltip from '$lib/components/ui/tooltip/index.js';
	import { cn } from '$lib/utils.js';
	import { weekdayAt } from './dates.js';
	import { buildGrid } from './grid.js';
	import type { ActivityCell } from './grid.js';
	import type { ActivityCalendarProps } from './types.js';

	let {
		data,
		start,
		end,
		weekStart = 1,
		levels = 4,
		thresholds,
		locale = 'es-CO',
		color = 'var(--primary)',
		emptyColor = 'var(--muted)',
		showWeekdays = true,
		showMonths = true,
		showLegend = true,
		caption,
		label,
		onselect,
		ref = $bindable(null),
		class: className,
		cellClass,
		cell: cellSnippet,
		tooltip,
		legend,
		...restProps
	}: ActivityCalendarProps<T> = $props();

	const grid = $derived(buildGrid<T>(data, { start, end, weekStart, levels, thresholds }));

	/**
	 * How many steps the ramp has.
	 *
	 * Read back off the grid rather than from `levels`, because `thresholds` overrides it: passing
	 * six cuts and leaving `levels` at its default would otherwise paint the top two levels the
	 * same colour.
	 */
	const steps = $derived(Math.max(grid.thresholds.length, 1));

	const dayFormat = $derived(
		new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short', year: 'numeric' })
	);
	const monthFormat = $derived(new Intl.DateTimeFormat(locale, { month: 'short' }));
	const weekdayFormat = $derived(new Intl.DateTimeFormat(locale, { weekday: 'long' }));
	const weekdayShortFormat = $derived(new Intl.DateTimeFormat(locale, { weekday: 'short' }));

	/** The seven row headings, in the order the rows are drawn. */
	const weekdays = $derived(
		Array.from({ length: 7 }, (_, row) => {
			const date = weekdayAt(weekStart, row);
			return { long: weekdayFormat.format(date), short: weekdayShortFormat.format(date) };
		})
	);

	const labelFor = $derived(
		label ?? ((cell: ActivityCell<T>) => `${cell.count} · ${dayFormat.format(cell.date)}`)
	);

	/**
	 * The fill for each level, level 0 first.
	 *
	 * Coral picks no colour: both ends of the ramp are theme tokens, and what it defines is the
	 * distance between them - which is the data, not the appearance. `color-mix` keeps every step
	 * an opaque colour, where the obvious `opacity` ramp would fade the focus ring along with the
	 * square and let whatever sits behind the grid bleed through the quiet days.
	 */
	const fills = $derived([
		emptyColor,
		...Array.from(
			{ length: steps },
			(_, step) =>
				`color-mix(in oklab, ${color} ${Math.round(((step + 1) / steps) * 100)}%, ${emptyColor})`
		)
	]);

	/** Clamped, because `ActivityDay.level` is the caller's number and need not fit the ramp. */
	const colorFor = $derived((level: number) => fills[Math.max(0, Math.min(level, steps))]);

	let frame = $state<HTMLDivElement | null>(null);

	const byKey = $derived(new Map(grid.cells.map((cell) => [cell.key, cell])));

	/**
	 * Which square Tab reaches. One tab stop for the whole grid, arrows to move inside it - the
	 * alternative is 365 tab stops between the thing above the grid and the thing below it.
	 *
	 * Held as a key rather than an index so that it survives the data changing underneath it.
	 */
	let focusKey = $state<string | null>(null);
	const tabbable = $derived((focusKey && byKey.get(focusKey)) || grid.cells[0]);

	type Live = { cell: ActivityCell<T>; box: string };

	/**
	 * Hover and focus are tracked apart, and hover wins where both are live.
	 *
	 * One `active` for the two of them reads simpler and is wrong: moving the mouse off the grid
	 * would then close the tooltip belonging to a square the keyboard is still sitting on.
	 */
	let hovered = $state<Live | null>(null);
	let focused = $state<Live | null>(null);
	const live = $derived(hovered ?? focused);

	/**
	 * Where a square sits inside the scroller, so the anchor can be parked on top of it.
	 *
	 * Measured rather than read off `offsetLeft`: `offsetParent` is defined to stop at the nearest
	 * `td`, `th` or `table` as well as at the nearest positioned ancestor, so inside a table every
	 * square reports an offset of roughly zero and the tooltip lands in the top-left corner. The
	 * scroll offsets go back in because the anchor is absolutely positioned inside the scroller,
	 * and so travels with its content.
	 */
	function locate(cell: ActivityCell<T>, element: HTMLElement): Live | null {
		if (!frame) return null;
		const square = element.getBoundingClientRect();
		const around = frame.getBoundingClientRect();
		const left = square.left - around.left + frame.scrollLeft;
		const top = square.top - around.top + frame.scrollTop;
		return {
			cell,
			box: `left:${left}px;top:${top}px;width:${square.width}px;height:${square.height}px`
		};
	}

	/**
	 * Focus moving between two squares fires a leave before the next enter. Closing on that leave
	 * would shut the tooltip on every arrow key, so a focus that stayed inside the grid is ignored.
	 */
	function blur(event: FocusEvent & { currentTarget: HTMLTableElement }) {
		const next = event.relatedTarget;
		if (next instanceof Node && event.currentTarget.contains(next)) return;
		focused = null;
	}

	const STEPS: Record<string, number> = {
		// Columns are weeks, so sideways is seven days and up-down is one. Both reduce to a step
		// along the chronological list, which cannot walk off the ragged first and last columns
		// the way moving by (week, weekday) coordinates can.
		ArrowLeft: -7,
		ArrowRight: 7,
		ArrowUp: -1,
		ArrowDown: 1
	};

	function move(event: KeyboardEvent) {
		if (!tabbable) return;

		let to: number;
		if (event.key in STEPS) to = tabbable.index + STEPS[event.key];
		else if (event.key === 'Home') to = 0;
		else if (event.key === 'End') to = grid.cells.length - 1;
		else return;

		event.preventDefault();
		// Clamped rather than wrapped: the ends of a calendar are ends, and a wrap would jump a
		// year with no way to tell it apart from a step.
		const target = grid.cells[Math.max(0, Math.min(grid.cells.length - 1, to))];
		focusKey = target.key;
		frame?.querySelector<HTMLButtonElement>(`[data-day="${target.key}"]`)?.focus();
	}
</script>

<!--
	Two knobs, as custom properties rather than props: a grid is sized, not styled, and every size
	in it derives from the square. Override them through `class` - `[--coral-cell:1rem]`.
-->
<div
	bind:this={ref}
	class={cn('flex w-full flex-col gap-3 [--coral-cell:0.75rem] [--coral-gap:0.1875rem]', className)}
	{...restProps}
>
	<Tooltip.Provider delayDuration={0} disableHoverableContent>
		<Tooltip.Root
			open={live !== null}
			onOpenChange={(open) => {
				if (open) return;
				hovered = null;
				focused = null;
			}}
		>
			<div bind:this={frame} class="relative overflow-x-auto">
				<!--
					One tooltip for the whole grid, anchored to an empty box parked over whichever
					square is live. A `Tooltip.Root` per square is the obvious build and it means ~365
					floating-ui instances mounted to show one of them; this is a single instance and a
					`left/top` write. The box takes no pointer events, so the tooltip opens and closes
					on the squares' own events, never on its own.
				-->
				<Tooltip.Trigger>
					{#snippet child({ props })}
						<span
							{...{ ...props, tabindex: -1 }}
							aria-hidden="true"
							class="pointer-events-none absolute"
							style={live?.box ?? 'left:0;top:0;width:0;height:0'}
						></span>
					{/snippet}
				</Tooltip.Trigger>

				<table
					class="border-separate border-spacing-(--coral-gap)"
					onpointerleave={() => (hovered = null)}
					onfocusout={blur}
				>
					{#if caption}
						<caption class="sr-only">{caption}</caption>
					{/if}

					{#if showMonths}
						<thead>
							<tr>
								{#if showWeekdays}
									<td class="p-0"></td>
								{/if}
								{#each grid.months as month (month.key)}
									<!-- A one-column run has no room for a name; the run it belongs to is
									     still spanned so the header stays in step with the body. -->
									<th
										colspan={month.span}
										scope="col"
										class="pb-1 text-left text-xs font-normal whitespace-nowrap text-muted-foreground"
									>
										{month.span > 1 ? monthFormat.format(month.date) : ''}
									</th>
								{/each}
							</tr>
						</thead>
					{/if}

					<tbody>
						{#each weekdays as weekday, row (row)}
							<tr>
								{#if showWeekdays}
									<!-- `leading-none` so the label cannot make its row taller than a square,
									     which would space the grid unevenly every other row. -->
									<th scope="row" class="pe-1 text-right align-middle leading-none font-normal">
										<!-- Every row names itself for a screen reader; only every other one
										     says it out loud, because seven labels at this size collide. -->
										<span class="sr-only">{weekday.long}</span>
										<span aria-hidden="true" class="text-xs leading-none text-muted-foreground">
											{row % 2 === 1 ? weekday.short : ''}
										</span>
									</th>
								{/if}

								{#each grid.weeks as week (week.key)}
									{@const cell = week.days[row]}
									<td class="p-0">
										{#if cell}
											<!--
												A button even with no `onselect`: it is what makes the square
												reachable, and a tooltip only a mouse can open is a tooltip half
												the readers never see. The `aria-label` carries the same text, so
												the value is readable without opening anything at all.
											-->
											<button
												type="button"
												data-day={cell.key}
												data-level={cell.level}
												tabindex={cell === tabbable ? 0 : -1}
												aria-label={labelFor(cell)}
												style="background-color: {colorFor(cell.level)}"
												class={cn(
													'block size-(--coral-cell) rounded-xs outline-offset-1 focus-visible:outline-2 focus-visible:outline-ring',
													onselect ? 'cursor-pointer' : 'cursor-default',
													cellClass
												)}
												onpointerenter={(event) => (hovered = locate(cell, event.currentTarget))}
												onfocus={(event) => {
													focusKey = cell.key;
													focused = locate(cell, event.currentTarget);
												}}
												onclick={() => onselect?.(cell)}
												onkeydown={move}
											>
												{@render cellSnippet?.(cell)}
											</button>
										{/if}
									</td>
								{/each}
							</tr>
						{/each}
					</tbody>
				</table>
			</div>

			{#if live}
				<Tooltip.Content>
					{#if tooltip}
						{@render tooltip(live.cell)}
					{:else}
						{labelFor(live.cell)}
					{/if}
				</Tooltip.Content>
			{/if}
		</Tooltip.Root>
	</Tooltip.Provider>

	{#if showLegend}
		{#if legend}
			{@render legend({ levels: steps, colorFor, thresholds: grid.thresholds, total: grid.total })}
		{:else}
			<!-- Swatches, no words: `Less`/`More` is copy, and the ramp reads without it. -->
			<div class="flex items-center gap-(--coral-gap) self-end" aria-hidden="true">
				{#each fills as fill, level (level)}
					<span class="block size-(--coral-cell) rounded-xs" style="background-color: {fill}"
					></span>
				{/each}
			</div>
		{/if}
	{/if}
</div>
