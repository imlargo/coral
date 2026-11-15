---
title: Gauge
description: A reading inside a known range, drawn as an arc - disk used, a quota, a score - and spoken as the number it shows.
group: Kit
---

<script lang="ts">
	import Preview from '#lib/features/docs/components/Preview.svelte';
	import basicDemo from './demos/basic.svelte?demo';
	import shapesDemo from './demos/shapes.svelte?demo';
	import formatDemo from './demos/format.svelte?demo';
	import colorDemo from './demos/color.svelte?demo';
	import middleDemo from './demos/middle.svelte?demo';
</script>

The usual gauge is an SVG with a `stroke-dashoffset` worked out by hand, a `<span>` in the middle
and nothing else: a screen reader hears the number with no range around it, or nothing at all,
and a disk 99.6% full is printed as `100%`.

- **A meter, not a progressbar.** `role="meter"` with the range, because a gauge is a reading and
  not a task moving towards done. A screen reader hears the text the middle shows, `37.5%` or
  `48 GB`, not a bare number.
- **Never full before it is.** A value inside the range that would round to either end is written
  as the closest step short of it: `99.6%` reads `99%`, and `0.3%` reads `1%`.
- **Cropped to the arc.** A half circle takes half the height, so it lines up with what is beside it
  without negative margins.
- **Clamped, but honest.** The arc stops at the ends of the range; the text still says `130`.
- **Right to left.** The arc fills the way the reader's eye travels, read from the page's direction.
- **Moves only when allowed.** A change of value eases the arc to its new length, and jumps under
  `prefers-reduced-motion`.

<Preview demo={basicDemo} />

## When to use

**Use it when**

- One reading sits inside a known range: disk used, seats taken on a plan, a build's test coverage,
  an API key's rate limit.
- The number should be read at a glance and heard with its range by a screen reader.

**Reach for something else when**

- Something is moving towards done, like an upload or a deployment: shadcn's `Progress` is
  announced as a task, which a gauge is not.
- The range is unknown or open-ended, like requests served today: print the number.
- The reading is many days of counts rather than one: use
  [Activity calendar](/docs/kit/activity-calendar).

## Usage

```svelte
<script lang="ts">
	import Gauge from '#lib/components/coral/kit/gauge/gauge.svelte';
</script>
```

```svelte
<Gauge value={14} max={20} aria-label="Seats used" />
```

## Examples

### Shapes

<Preview demo={shapesDemo} />

`sweep` is how much of a circle the arc covers, `270` by default. Anything short of `360` opens at
the bottom and is symmetric; `360` is a ring that starts at twelve o'clock. A ring reads as a
progress ring or a spinner as easily as a gauge, which is why it is not the default.

### Units and percents

<Preview demo={formatDemo} />

`format` is passed to `Intl.NumberFormat`, the same as on [number input](/docs/kit/number-input),
and the text follows `locale`. With `{ style: 'percent' }` the value is the fraction, so the range is
`0` to `1`.

Where the number alone does not say enough, word the reading yourself with `aria-valuetext`. It
lands on the meter and wins over the default:

```svelte
<Gauge value={48} max={64} aria-label="Memory" aria-valuetext="48 of 64 GB" />
```

### Outside the range

A value below `min` or above `max` draws the arc empty or full, and the middle and the meter's
text still say the real number. `aria-valuenow` is clamped to the range, as ARIA requires. A value
that is not a finite number is reported to ARIA as `min`.

## Props

| Prop           | Type                                   | Default             | Description                                       |
| -------------- | -------------------------------------- | ------------------- | ------------------------------------------------- |
| `value`        | `number`                               | -                   | The reading. Required.                            |
| `min`          | `number`                               | `0`                 | Where the arc starts.                             |
| `max`          | `number`                               | `100`               | Where it is full.                                 |
| `sweep`        | `number`                               | `270`               | Degrees of a circle the arc covers.               |
| `thickness`    | `number`                               | `10`                | The stroke, in hundredths of the width.           |
| `locale`       | `string`                               | `en-US`             | The number in the middle and in the meter's text. |
| `format`       | `Intl.NumberFormatOptions`             | -                   | A percent, a unit, a currency.                    |
| `color`        | `string`                               | `var(--primary)`    | The filled part.                                  |
| `emptyColor`   | `string`                               | `var(--muted)`      | The track.                                        |
| `ref`          | `HTMLDivElement \| null`               | `null`              | Bindable. The root element.                       |
| `class`        | `string`                               | -                   | Merged onto the root. Carries the size knob.      |
| `contentClass` | `string`                               | -                   | Merged onto the box in the middle.                |
| `children`     | `Snippet<[{ value, fraction, text }]>` | the formatted value | Replaces the middle.                              |

Everything else, `aria-valuetext` included, lands on the root element.

## Keyboard

Nothing to press: the gauge takes no focus and Tab passes over it, because there is nothing on it
to operate.

## Accessibility

The meter needs a name: pass `aria-label`, or point `aria-labelledby` at the heading or label that
names it. Coral writes none, because what is being measured is copy. It takes no focus: a meter is
read, not operated.

The reading is `role="meter"` with `aria-valuenow`, `aria-valuemin`, `aria-valuemax` and an
`aria-valuetext` written in `locale` and `format`. The drawing and the middle are hidden from screen
readers, so the number is heard once. The arc eases to a new value with a transition, and jumps
under `prefers-reduced-motion`.

## Customizing

- **`class`** is merged onto the root and carries `--coral-gauge`; **`contentClass`** is merged onto
  the box in the middle.
- **`children`** replaces the middle, below.
- **Project-wide locale.** The gauge reads the shared `locale` stated with
  [`setCoralDefaults`](/docs/conventions#project-wide-defaults); a `locale` prop still wins. It
  declares no defaults of its own.

### Colour and size

<Preview demo={colorDemo} />

`color` and `emptyColor` are the filled part and the track, theme tokens by default. Coral does not
decide when a reading becomes a warning: that line is the product's, so the colour is worked out
where the value is, from the value.

`--coral-gauge` is the width, a custom property rather than a prop because a gauge is sized, not
styled: `class="[--coral-gauge:--spacing(24)]"`. `thickness` is the stroke, in hundredths of that
width, so the drawing keeps its proportions at any size.

### The middle

<Preview demo={middleDemo} />

`children` replaces what the middle shows and receives `{ value, fraction, text }`. It is drawn
over the square inside the stroke and hidden from screen readers, which already hear the reading
through the meter. A gauge too small for a number takes `contentClass="hidden"` and has its number
written beside it.

### The pieces

`arcFor` and `fractionOf` in `arc.ts`, and `readingText` in `reading.ts`, are the geometry and the
wording, exported on their own. An SVG of your own built from them keeps the crop and the
never-full-before-it-is text, and leaves you to write the meter role, its values and the
reduced-motion transition back.

### Why flat props

Flat props, because a gauge has a canonical case: one value, one range, the number in the middle.

## What it does not do

- **No zones or ticks.** Bands drawn on the track say where the product draws its lines, which is
  the product's to draw. Colour the arc from the value instead.
- **No progress.** For a task moving towards done, use shadcn's `Progress`: it is announced as one.
- **No loading state.** A gauge with nothing to read is not a gauge yet; render a `Skeleton` in its
  place until there is a value.
