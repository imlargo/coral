---
title: Activity calendar
description: A year of daily counts as a grid of squares - the GitHub contribution graph, with the timezone and the scale done right.
---

<script lang="ts">
	import Preview from '$lib/docs/preview.svelte';
</script>

Counts per day, one square each, weeks as columns. Coral draws the calendar, buckets the counts and
handles the keyboard; what the numbers mean stays with the project.

<Preview name="kit/activity-calendar/basic" class="justify-start overflow-x-auto" />

## What Coral adds

- **The squares land on the right day.** `new Date('2026-01-05')` is UTC midnight, which in Bogotá is
  the 4th - so the naive grid is a day off, all year, only for readers west of Greenwich.
- **A scale that survives real data.** Levels come from quantiles of the non-empty days, not from
  slicing `0..max`.
- **One tab stop, arrow keys inside it.** Not 365 tab stops between whatever sits above the grid and
  whatever sits below it.
- **One tooltip, not 365.** A single floating instance is moved onto the live square.
- **Repeats are summed.** Activity arrives as events; three commits on Tuesday are three rows.
- **Missing days are drawn, not skipped.** A gap in the data is an empty square, not a missing column.

## The data

```ts
type ActivityDay<T = unknown> = {
	date: string | Date; // 'YYYY-MM-DD', or a moment
	count: number;
	level?: number; // when the server already bucketed
	meta?: T; // handed back to the tooltip and to onselect
};
```

Order does not matter. Days you leave out are drawn empty. Days you repeat are added together -
every wrapper worth comparing against keys them into a `Map` and silently keeps the last one.

Without `start` and `end` the grid spans the earliest and latest days in the data. Pass both to hold
a window still while the data underneath it changes.

### `'YYYY-MM-DD'` is a day, a `Date` is a moment

The two are read differently, on purpose:

| Given                      | Read as                                   |
| -------------------------- | ----------------------------------------- |
| `'2026-01-05'`             | that calendar day, wherever the reader is |
| `'2026-01-05T02:00:00Z'`   | a moment - its **local** day              |
| `new Date(2026, 0, 5, 23)` | a moment - its **local** day              |

A bare date has no time in it, so treating it as UTC midnight - which is what `new Date` is
specified to do - shifts the whole grid one square in every negative-offset timezone. Anything with
a clock in it is a real instant, and its day is the day it happened where you are.

Dates are normalised to **local noon** rather than midnight. Midnight is the one instant a DST jump
can delete, and where it does the browser rolls back to the previous day.

## Levels

Four steps above zero by default. The cuts are quantiles of the **non-empty** days:

```ts
thresholdsFor([1, 2, 3, 4, 5, 6, 7, 8], 4); // [1, 3, 5, 7]
```

Level 1 always starts at 1 - any activity at all has to read as activity - and every cut is forced
above the one before it, so flat data degrades to `1, 2, 3, 4` instead of collapsing three levels
onto the same count.

Slicing `0..max` into equal bands is the obvious alternative and it is wrong for this shape of data:
activity is long-tailed, so a single 40-commit day pushes the whole year into the first band and
paints one square dark.

Pass `thresholds` to fix the cuts yourself. Do that whenever two grids sit side by side - otherwise
each one is scaled to its own busiest day and the darker grid is not the busier one. The number of
cuts is then the number of steps and `levels` is ignored, so the ramp cannot end up with more levels
than the scale has room for.

<Preview name="kit/activity-calendar/thresholds" class="justify-start overflow-x-auto" />

## Colour

Coral picks none. The ramp is mixed between two theme tokens:

```css
color-mix(in oklab, var(--primary) 50%, var(--muted));
```

What Coral defines is the _distance_ between the ends - which is the data, not the appearance. Move
the ends with `color` and `emptyColor`; a chart token is usually what you want.

`color-mix` rather than an opacity ramp: opacity would fade the focus ring along with the square, and
let whatever sits behind the grid bleed through the quiet days.

## Size

Two CSS custom properties, set through `class`:

```svelte
<ActivityCalendar {data} class="[--coral-cell:1rem] [--coral-gap:0.25rem]" />
```

<Preview name="kit/activity-calendar/scale" class="justify-start overflow-x-auto" />

Everything in the grid derives from the square, so those two are the whole knob. They are custom
properties rather than props because a grid is sized, not styled.

## Copy

The default square label is `3 · 5 ene 2026`. It is deliberately wordless: `3 contributions` is copy,
copy is the project's, and Coral does not know what is being counted.

`label` is where it goes. It feeds both the tooltip and the square's accessible name, so writing it
once fixes both.

<Preview name="kit/activity-calendar/labelled" class="justify-start overflow-x-auto" />

## The pieces

For anything richer than a line of text, `tooltip` replaces the body outright and receives the same
cell - including whatever `meta` you hung on the day. `legend` replaces the swatch row and is handed
the ramp and the cuts, so a legend that reads `1 ▢▢▢▢▢ 12+` needs nothing Coral did not already
compute.

<Preview name="kit/activity-calendar/pieces" class="justify-start overflow-x-auto" />

`meta` is generic and untouched: Coral carries it from `data` to the snippet and to `onselect`, and
never reads it.

## Selection

<Preview name="kit/activity-calendar/select" class="justify-start overflow-x-auto" />

`onselect` fires on click, Enter and Space. There is no selected state: no project in the corpus
keeps one on the grid itself - they open a panel, filter a list, push a route.

## Keyboard and screen readers

The grid is one tab stop. Inside it:

| Key          | Moves           |
| ------------ | --------------- |
| `←` `→`      | one week        |
| `↑` `↓`      | one day         |
| `Home` `End` | first, last day |

Sideways is seven days along the same list the arrows step through, so movement cannot fall off the
ragged first and last columns the way `(week, weekday)` coordinates can.

It is a real `<table>`: months are column headers, weekdays are row headers, and `caption` names
the whole grid. Every row names itself
for a screen reader and only every other one says it out loud, because seven labels at that size
collide. Each square carries its `label` as its accessible name, so the tooltip is decoration rather
than the only way to read a value.

## Installation

```bash
pnpm dlx shadcn-svelte@latest add tooltip
```

```svelte
<script lang="ts">
	import ActivityCalendar from '$lib/coral/kit/activity-calendar/activity-calendar.svelte';
	import type { ActivityCell, ActivityDay } from '$lib/coral/kit/activity-calendar/types.js';
</script>
```

## Props

| Prop           | Type                         | Default          | Description                                   |
| -------------- | ---------------------------- | ---------------- | --------------------------------------------- |
| `data`         | `ActivityDay<T>[]`           | -                | Unordered. Gaps drawn, repeats summed.        |
| `start`        | `string \| Date`             | earliest day     | First day drawn.                              |
| `end`          | `string \| Date`             | latest day       | Last day drawn.                               |
| `weekStart`    | `0 \| 1 \| ... \| 6`         | `1`              | Row zero. `0` is Sunday.                      |
| `levels`       | `number`                     | `4`              | Steps above zero. Ignored with `thresholds`.  |
| `thresholds`   | `number[]`                   | from the range   | Minimum count per level, ascending.           |
| `locale`       | `string`                     | `es-CO`          | Month, weekday and date labels.               |
| `color`        | `string`                     | `var(--primary)` | The busiest fill.                             |
| `emptyColor`   | `string`                     | `var(--muted)`   | The level-zero fill.                          |
| `showWeekdays` | `boolean`                    | `true`           | The row headers.                              |
| `showMonths`   | `boolean`                    | `true`           | The column headers.                           |
| `showLegend`   | `boolean`                    | `true`           | The swatch row.                               |
| `caption`      | `string`                     | -                | Names the grid for a screen reader.           |
| `label`        | `(cell) => string`           | `3 · 5 ene 2026` | Tooltip text and accessible name.             |
| `onselect`     | `(cell) => void`             | -                | Click, Enter or Space on a square.            |
| `ref`          | `HTMLDivElement \| null`     | `null`           | Bindable. The root element.                   |
| `class`        | `string`                     | -                | Merged onto the root. Carries the size knobs. |
| `cellClass`    | `string`                     | -                | Merged onto every square.                     |
| `cell`         | `Snippet<[ActivityCell<T>]>` | -                | Renders inside a square, over the fill.       |
| `tooltip`      | `Snippet<[ActivityCell<T>]>` | -                | Replaces the tooltip body.                    |
| `legend`       | `Snippet<[LegendContext]>`   | -                | Replaces the legend row.                      |

Everything else lands on the root element.

## What it does not do

- **No range picker, no year tabs, no "last 12 months" button.** Those are three different products
  in three different projects; `start` and `end` are the seam they all sit on.
- **No fetching.** The grid takes an array.
- **No `count` formatting.** A count is a number until `label` says otherwise.
