---
title: Number input
description: A number field with steppers, bounds that hold, and arithmetic that stays exact.
---

<script lang="ts">
	import Preview from '$lib/docs/preview.svelte';
</script>

Three projects in the corpus wrote this. Two are copies of each other that have since diverged: one
of them clamps a typed value to `[min, max]`, the other does not - so its steppers refuse to pass the
cap while the keyboard walks straight through it. The third dropped the text field entirely and
shipped `-` / value / `+`.

<Preview name="kit/number-input/basic" />

## What Coral adds

- **The bounds hold both ways.** Steppers stop at the edge _and_ a typed value clamps on commit.
- **The field never lies.** Clamping `150` to `10` also rewrites what is on screen, so the number you
  read is the number that is stored.
- **The arithmetic stays exact.** Stepping by `0.1` gives `0.3`, not `0.30000000000000004`.
- **Scrolling does not edit.** A focused `type="number"` steps on wheel in Chromium; a page scrolled
  past one would change silently.
- **Empty means empty.** Clearing the field gives `undefined`, not the minimum.

Everything else is the primitive's: `input-group` puts the steppers inside the field, so it reads as
one control with one focus ring instead of three.

## Bounds

<Preview name="kit/number-input/bounds" />

Type `999` into that field and click away. It becomes `25`, and the field itself updates - the state
and what you can see never disagree.

Clamping happens on commit (blur, Enter, an arrow-key step), not on every keystroke. Clamping per
keystroke fights the person typing: with a max of `100` the `1` of `150` is fine and the `15` is
fine, and only the finished number is wrong.

A stepper disables itself once the value is against its bound. Leave `min` or `max` out and that
direction is unbounded - **negatives included**. One project in the corpus defaults `min` to `0`,
which quietly makes a temperature or a balance field impossible.

## Decimals

<Preview name="kit/number-input/decimals" />

`step` sets the precision as well as the jump, so `step={0.1}` rounds to one decimal. When the two
genuinely differ - money that steps by whole units but stores cents - set `decimals` on its own.

## Empty, readonly, disabled

<Preview name="kit/number-input/states" />

An empty field keeps both steppers live, because stepping from empty has somewhere to go either way.
The first press lands on the first allowed value: with `min={5}`, `+` gives `5`, not `6`.

## Installation

```bash
pnpm dlx shadcn-svelte@latest add input-group
```

```svelte
<script lang="ts">
	import NumberInput from '$lib/coral/kit/number-input/number-input.svelte';
</script>
```

## Props

Everything the shadcn input accepts stays available - `placeholder`, `disabled`, `readonly`, `name`,
`id`, `aria-*`, `ref`. On top of that:

| Prop             | Type                                   | Default     | Description                                                  |
| ---------------- | -------------------------------------- | ----------- | ------------------------------------------------------------ |
| `value`          | `number`                               | -           | Bindable. `undefined` means empty.                           |
| `min`            | `number`                               | -           | Lowest allowed. Omitted means unbounded, negatives included. |
| `max`            | `number`                               | -           | Highest allowed. Omitted means unbounded.                    |
| `step`           | `number`                               | `1`         | Jump per press. Also sets the rounding precision.            |
| `decimals`       | `number`                               | from `step` | Rounding precision, when it differs from the step.           |
| `onchange`       | `(value: number \| undefined) => void` | -           | Fired on a stepper or a committed edit. Never on mount.      |
| `decrementLabel` | `string`                               | `Decrease`  | Accessible label for the `−` button.                         |
| `incrementLabel` | `string`                               | `Increase`  | Accessible label for the `+` button.                         |
| `class`          | `string`                               | -           | Merged onto the input - e.g. its width.                      |
| `groupClass`     | `string`                               | -           | Merged onto the bordered group around everything.            |

## Accessibility

The field stays a native `input type="number"`, so it keeps what the browser already gives: arrow
keys step, mobile shows a numeric keypad, and assistive tech reads it as a spinbutton with its
`min`, `max` and `step`. The two stepper buttons carry labels and are `type="button"`, so neither
submits a surrounding form.

The native spinner arrows are hidden, because the component draws its own and two sets of steppers on
one field is one too many.

> **One thing to know about locale.** `type="number"` parses through the browser, which in a
> Spanish locale may accept `1,5` and in another only `1.5`. If a field must accept a decimal comma
> everywhere, that is a text field with its own parsing - not this component.

## step.ts

The arithmetic lives in `kit/number-input/step.ts` and is exported on its own, so the same clamping
and rounding can be reused where there is no input - validating a payload, totalling a column.

```ts
import { clamp, decimalsOf, round, stepValue } from '$lib/coral/kit/number-input/step.js';

decimalsOf(0.05); // 2
round(0.1 + 0.2, 1); // 0.3
clamp(150, 0, 25); // 25
stepValue({ value: undefined, delta: 1, min: 5, decimals: 0 }); // 5
```
