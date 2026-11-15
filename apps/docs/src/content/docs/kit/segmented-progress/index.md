---
title: Segmented progress
description: Steps or levels drawn as a row of segments - an onboarding flow, a password's strength - read as progress or as a meter.
group: Kit
category: Data display
---

<script lang="ts">
	import Preview from '#lib/features/docs/components/Preview.svelte';
	import basicDemo from './demos/basic.svelte?demo';
	import strengthDemo from './demos/strength.svelte?demo';
	import stepperDemo from './demos/stepper.svelte?demo';
</script>

The usual segmented bar is a row of `<div>`s coloured by index: a screen reader hears nothing at
all, an onboarding flow and a password's strength are the same markup although one is a task and
the other a reading, and the current step is widened with a width written at the call site.

- **Progress or a meter.** `type="progress"`, the default, is a `progressbar` heard as "Step 2 of
  4". `type="meter"` is a `meter` lit to a level, heard as the word you give that level: "Strong".
- **The current step stands out by shape.** It grows wider than the rest instead of only changing
  colour, so it is not told by colour alone.
- **Held to the segments.** A value past either end fills every segment or none, and a fractional
  one rounds down, so a segment is never drawn reached before it is.
- **Right to left.** The row fills from the side the reader starts on, read from the page's
  direction.
- **Moves only when allowed.** A step eases to its new width and colour, and jumps under
  `prefers-reduced-motion`.

<Preview demo={basicDemo} />

## When to use

**Use it when**

- A flow has a few known steps and the reader should see how far along they are: onboarding,
  setting up a workspace, a checkout.
- A reading has a few named levels: a password's strength, a plan's tier, a signal.

**Reach for something else when**

- The steps should be clickable, or each has a title worth showing: use
  [Stepper](/docs/kit/stepper), and put this inside it if you want the bar too.
- The task is continuous, like an upload: shadcn's `Progress` is one bar that fills smoothly.
- The reading sits in a wide range, like disk used: use [Gauge](/docs/kit/gauge).

## Usage

```svelte
<script lang="ts">
	import SegmentedProgress from '#lib/components/coral/kit/segmented-progress/segmented-progress.svelte';
</script>
```

```svelte
<SegmentedProgress count={4} value={2} aria-label="Workspace setup" />
```

## Examples

### Password strength

<Preview demo={strengthDemo} />

`type="meter"` lights the segments up to the level and sets none apart. `valueText` gives each
level its word, which is what a screen reader hears. How a password is scored, and the level at
which the colour turns, are the product's rules: the demo works both out next to the input and
passes `color`.

### Inside a stepper

<Preview demo={stepperDemo} />

[Stepper](/docs/kit/stepper) hands its children the current step, so the bar is one line:
`value={steps.indexOf(value) + 1}`. The stepper keeps the validation, the panels and the focus;
this only draws how far along the flow is.

### Outside the range

`value` is held to `0`-`count` and rounded down. With `type="progress"`, `0` is a flow not started,
with no current step, and `count` is the last step being worked on. `aria-valuenow` is the held
value. A `count` that is not a whole positive number draws what it rounds down to, or nothing.

## Props

| Prop           | Type                             | Default                 | Description                                          |
| -------------- | -------------------------------- | ----------------------- | ---------------------------------------------------- |
| `count`        | `number`                         | -                       | How many segments. Required.                         |
| `value`        | `number`                         | -                       | The current step from `1`, or the level. Required.   |
| `type`         | `'progress' \| 'meter'`          | `'progress'`            | A task through steps, or a level.                    |
| `valueText`    | `(value, count, type) => string` | "Step 2 of 4", "2 of 4" | What a screen reader hears.                          |
| `locale`       | `string`                         | `en-US`                 | Writes the numbers in the default text.              |
| `color`        | `string`                         | `var(--primary)`        | The reached segments.                                |
| `emptyColor`   | `string`                         | `var(--muted)`          | The segments not reached yet.                        |
| `ref`          | `HTMLDivElement \| null`         | `null`                  | Bindable. The root element.                          |
| `class`        | `string`                         | -                       | Merged onto the root, which sets the height and gap. |
| `segmentClass` | `string`                         | -                       | Merged onto every segment.                           |

Everything else, `aria-valuetext` included, lands on the root element.

## Keyboard

Nothing to press: the bar takes no focus and Tab passes over it. Moving between steps is the
buttons' job, or the [Stepper](/docs/kit/stepper)'s.

## Accessibility

The bar needs a name: pass `aria-label`, or point `aria-labelledby` at the heading that names it.
Coral writes none, because what is being measured is copy.

It is `role="progressbar"` or `role="meter"` with `aria-valuenow`, `aria-valuemin` (`0`),
`aria-valuemax` (`count`) and an `aria-valuetext`. The segments are drawing only: a progressbar and a
meter present their children as one image, so a screen reader hears the value once. The current
step is set apart by its width, not only by its colour. A word shown beside a meter, like the
strength in the demo, repeats what the meter already says, so it is hidden from screen readers.

## Customizing

- **`class`** is merged onto the root, which sets the height and the gap: `class="h-2 gap-2"`.
- **`segmentClass`** is merged onto every segment. Each one carries `data-state`, `complete`,
  `current` or `upcoming` for progress and `filled` or `empty` for a meter, so a state is styled on
  its own: `segmentClass="data-[state=current]:grow-3"` widens the current step further, and
  `data-[state=current]:grow` draws it the same as the rest.
- **`color`** and **`emptyColor`** are the reached segments and the rest, theme tokens by default.
  Work the colour out from the value where the value is, as the strength demo does.
- **Project-wide copy.** `valueText` can be stated once with
  [`setCoralDefaults`](/docs/conventions#project-wide-defaults) under `kit/segmented-progress`,
  along with the shared `locale`. It receives the `type`, so one function words both. A prop at the
  call site still wins.

### The pieces

`rangeOf` and `stateOf` in `segments.ts` hold the value to the segments and name each segment's
state, exported on their own. A row of your own built from them keeps the clamping and the states,
and leaves you to write the role, its values and the reduced-motion transition back.

### Why flat props

Flat props, because the bar has a canonical case: a count, a value, one segment per step. What
varies is how a segment looks, and that is `segmentClass` and `data-state`, not a prop per look.

## What it does not do

- **No titles or clickable steps.** That is a [Stepper](/docs/kit/stepper); put this inside one.
- **No scoring.** It draws the level it is given. How strong a password is belongs to the product.
- **No partial segments.** A step is reached or it is not. For a task that fills smoothly, use
  shadcn's `Progress`.
