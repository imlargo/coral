---
title: Number input
description: A number field with steppers, bounds that hold, and arithmetic that stays exact.
group: Kit
---

<script lang="ts">
	import Preview from '#lib/features/docs/components/Preview.svelte';
</script>

A hand-rolled stepper field clamps in one direction and forgets the other: the buttons stop at the
cap while a typed `150` walks straight through it, so the same field enforces its bounds with the
mouse and not with the keyboard. Dropping the text field entirely (just `-` / value / `+`) closes
that hole by taking typing away, which turns a jump from `1` to `40` into thirty-nine presses.

<Preview name="kit/number-input/basic" />

## What Coral adds

- **The bounds hold both ways.** Steppers stop at the edge _and_ a typed value clamps on commit.
- **The field never lies.** Clamping `150` to `10` also rewrites what is on screen, so the number you
  read is the number that is stored.
- **The arithmetic stays exact.** Stepping by `0.1` gives `0.3`, not `0.30000000000000004`.
- **Decimals the way the reader writes them.** `1,5` is one and a half in `de-DE` and `es-CO`, and
  the field shows it back with the same comma. A `type="number"` field drops it.
- **Empty means empty.** Clearing the field gives `undefined`, not the minimum.

Everything else is the primitive's: `input-group` puts the steppers inside the field, so it reads as
one control with one focus ring instead of three.

## Bounds

<Preview name="kit/number-input/bounds" />

Type `999` into that field and click away. It becomes `25`, and the field itself updates: the state
and what you can see never disagree.

Clamping happens on commit (blur, Enter, an arrow-key step), not on every keystroke. Clamping per
keystroke fights the person typing: with a max of `100` the `1` of `150` is fine and the `15` is
fine, and only the finished number is wrong.

A stepper disables itself once the value is against its bound. Leave `min` or `max` out and that
direction is unbounded, **negatives included**. Defaulting `min` to `0` is the tempting shortcut,
and it quietly makes a temperature or a balance field impossible to express.

## Decimals

<Preview name="kit/number-input/decimals" />

`step` sets the precision as well as the jump, so `step={0.1}` rounds to one decimal. When the two
genuinely differ (money that steps by whole units but stores cents), set `decimals` on its own.

## Locale

<Preview name="kit/number-input/locale" />

Most of Europe and Latin America write a decimal with a comma, and a `type="number"` field reports
`1,5` as empty, so the value is dropped on commit and the reader watches their field clear itself.
This component is a text field that reads and writes the number in `locale`: `1,5` is one and a
half there, `1.234,5` is a thousand and change, and the field shows the number back with the
separators that locale uses. The rules are the locale's own, so in `de-DE` a typed `1.5` is fifteen,
exactly as `1.500` is fifteen hundred.

`locale` defaults to `en-US`, or to whatever the project stated with
[`setCoralDefaults`](/docs/conventions#project-wide-defaults).

## Currency, percent and units

<Preview name="kit/number-input/format" />

`format` is passed to `Intl.NumberFormat`, so the field writes `$1234.50`, `15%` or `20 GB` the way
`locale` does, and reads it back past the symbol whether or not the reader typed it. A
hand-rolled currency field usually does one of the two: it shows the symbol and then rejects
`$7.25` as not a number, or it accepts `7.25` and drops the symbol for good.

- **A currency keeps its cents.** The precision defaults to the digits the currency always shows,
  two for dollars and none for yen, so a step of `1` still takes `7.25`.
- **A percent is a fraction.** `0.15` shows as `15%`, and `15` typed into the field is fifteen
  percent. Set `step={0.01}` for one percent per press.
- **No grouping while editing**, for the reason the field never groups: a separator appearing under
  the caret is one more character to delete on the next edit.

## Keyboard

| Key                     | Does                                     |
| ----------------------- | ---------------------------------------- |
| `↑` / `↓`               | Step by `step`                           |
| `Shift` + `↑` / `↓`     | Step by `largeStep`                      |
| `Page Up` / `Page Down` | Step by `largeStep`                      |
| `Home` / `End`          | Jump to `min` / `max`, when bounded      |
| `Escape`                | Put back the value the field already had |

The same keys as [scrub input](/docs/kit/scrub-input), from the same shared handler, so a number
behaves the same whichever field holds it. `Escape` is only taken while there is an edit to put
back; otherwise it goes on to the dialog around the field.

## Empty, readonly, disabled

<Preview name="kit/number-input/states" />

An empty field keeps both steppers live, because stepping from empty has somewhere to go either way.
The first press lands on the first allowed value: with `min={5}`, `+` gives `5`, not `6`.

## Import

```svelte
<script lang="ts">
	import NumberInput from '#lib/components/coral/kit/number-input/number-input.svelte';
</script>
```

## Props

Everything the shadcn input accepts stays available: `placeholder`, `disabled`, `readonly`, `name`,
`id`, `aria-*`, `ref`. On top of that:

| Prop             | Type                                   | Default     | Description                                                  |
| ---------------- | -------------------------------------- | ----------- | ------------------------------------------------------------ |
| `value`          | `number`                               | -           | Bindable. `undefined` means empty.                           |
| `min`            | `number`                               | -           | Lowest allowed. Omitted means unbounded, negatives included. |
| `max`            | `number`                               | -           | Highest allowed. Omitted means unbounded.                    |
| `step`           | `number`                               | `1`         | Jump per press. Also sets the rounding precision.            |
| `largeStep`      | `number`                               | `step * 10` | Jump for the paging keys, and the arrows with Shift.         |
| `decimals`       | `number`                               | from `step` | Rounding precision, when it differs from the step.           |
| `locale`         | `string`                               | `en-US`     | How the number is typed and shown.                           |
| `format`         | `Intl.NumberFormatOptions`             | -           | A currency, a percent or a unit, written and read back.      |
| `onchange`       | `(value: number \| undefined) => void` | -           | Fired on a stepper or a committed edit. Never on mount.      |
| `decrementLabel` | `string`                               | `Decrease`  | Accessible label for the `−` button.                         |
| `incrementLabel` | `string`                               | `Increase`  | Accessible label for the `+` button.                         |
| `class`          | `string`                               | -           | Merged onto the input - e.g. its width.                      |
| `groupClass`     | `string`                               | -           | Merged onto the bordered group around everything.            |

## Accessibility

The field is a text input with `role="spinbutton"`, which is what a number field is to assistive
tech: it announces its value and its bounds through `aria-valuenow`, `aria-valuemin` and
`aria-valuemax`, and `aria-valuetext` carries the number as the locale writes it. `inputmode` asks a
phone for a numeric keypad, with a decimal key when the step needs one. The two stepper buttons
carry labels and are `type="button"`, so neither submits a surrounding form.

What the native number type gave for free - the role, the keypad, the arrow keys - is put back by
hand so that it can give the locale back too. Nothing else is lost: a text field does not step on
the mouse wheel, so the Chromium quirk that edited a focused number field under a scrolling page
has nothing to act on.

## lib/number

The arithmetic lives in `lib/number.ts`, shared with [scrub input](/docs/kit/scrub-input) so a value
moved by either field lands on the same number. It is exported on its own, so the same clamping and
rounding can be reused where there is no input at all: validating a payload, totalling a column.

```ts
import { clamp, decimalsOf, round, stepValue } from '#lib/components/coral/lib/number.js';

decimalsOf(0.05); // 2
round(0.1 + 0.2, 1); // 0.3
clamp(150, 0, 25); // 25
stepValue({ value: undefined, delta: 1, min: 5, decimals: 0 }); // 5
```

They live in `lib/number.ts` rather than beside the component because [scrub input](/docs/kit/scrub-input)
steps its value the same way, and the two cannot be allowed to drift. `parse` and `format` read and
write a number in a locale, and both fields compose everything through `lib/number-field.ts`, which
also holds the commit, the typed-value read and the keyboard.
