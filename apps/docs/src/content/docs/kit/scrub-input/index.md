---
title: Scrub input
description: A number field whose label is a drag handle - drag it, type it, or step it with the arrow keys.
---

<script lang="ts">
	import Preview from '$docs/preview.svelte';
</script>

Inspector panels are made of number fields, and reaching for a stepper twenty times to find the
right padding is not how anyone wants to find it. Every design tool answers the same way: the label
beside the number is a handle, and dragging it sweeps through the range. The hand-rolled version is
a `pointermove` listener that reads `clientX`, and it has three holes: dragging selects the label
text, slow drags of a pixel at a time round to nothing, and there is no way back once the pointer
has started moving.

<Preview name="kit/scrub-input/basic" class="min-h-72" />

## What Coral adds

- **A pixel at a time still counts.** Distance too short for a step is carried to the next move
  instead of being rounded away, so a careful drag moves the number as reliably as a fast one.
- **Escape puts it back.** Mid-drag, the value returns to what it was when the drag began. The same
  key while typing restores the field.
- **Shift is coarse everywhere.** On the handle and on the arrow keys alike, which is one rule to
  learn rather than two.
- **A drag is one action.** `onscrubstart` and `onscrubend` bracket it, so an editor records one
  undo entry per drag rather than one per step.
- **The drag survives the pointer leaving.** It is captured, so a fast sweep that runs off the
  handle, or off the field entirely, keeps driving the number until the button comes up.
- **The label is a label.** A real `<label>`, so assistive tech names the field with it and a plain
  click focuses and selects the number. Dragging does not steal that focus, and does not select
  text on the way.

## Bounds, steps and units

<Preview name="kit/scrub-input/bounds" class="min-h-64" />

`step` sets both the jump and the precision, so `step={0.05}` rounds to two decimals; `largeStep`
is what Shift uses, and defaults to ten times `step`. `pixelsPerStep` is the sensitivity: at `1` the
number follows the pointer pixel for pixel, which is what a field measured in pixels wants, while a
field measured in milliseconds usually wants more travel per step.

Bounds hold from every direction: the drag, the arrow keys and a typed number all clamp on commit.
Clamping only on commit is deliberate - with a max of `30000`, the `3` and the `300` of `30000` are
both fine on the way, and only the finished number can be wrong.

## One drag, one undo

<Preview name="kit/scrub-input/history" class="min-h-80" />

## Scrub or steppers

[Number input](/docs/kit/number-input) is the same value with `−` and `+` buttons around it. Use it
in a form, where a field is read once and typed into; reach for this one in an inspector, where a
dozen numbers sit in a column and are adjusted by feel. They share their arithmetic, so a value
moved by one behaves exactly as it would in the other.

## Import

```svelte
<script lang="ts">
	import ScrubInput from '$lib/components/coral/kit/scrub-input/scrub-input.svelte';
</script>
```

## Props

Everything the shadcn input accepts stays available - `name`, `id`, `placeholder`, `required`,
`aria-*`, `ref`. On top of that:

| Prop            | Type                                   | Default     | Description                                                  |
| --------------- | -------------------------------------- | ----------- | ------------------------------------------------------------ |
| `label`         | `string`                               | -           | The handle text, and the field's name. Required.             |
| `value`         | `number`                               | -           | Bindable. `undefined` means the field is empty.              |
| `min`           | `number`                               | -           | Lowest allowed. Omitted means unbounded, negatives included. |
| `max`           | `number`                               | -           | Highest allowed. Omitted means unbounded.                    |
| `step`          | `number`                               | `1`         | Jump per step. Also sets the rounding precision.             |
| `largeStep`     | `number`                               | `step * 10` | Jump per step while Shift is held.                           |
| `decimals`      | `number`                               | from `step` | Rounding precision, when it differs from the step.           |
| `pixelsPerStep` | `number`                               | `2`         | Pointer travel per step. Lower is faster.                    |
| `onchange`      | `(value: number \| undefined) => void` | -           | A drag, an arrow key or a committed edit. Never on mount.    |
| `onscrubstart`  | `(value: number \| undefined) => void` | -           | A drag began, with the value it began at.                    |
| `onscrubend`    | `(value: number \| undefined) => void` | -           | A drag ended or was cancelled.                               |
| `suffix`        | `string`                               | -           | Unit shown after the number.                                 |
| `disabled`      | `boolean`                              | `false`     | Blocks the drag and the keyboard.                            |
| `readonly`      | `boolean`                              | `false`     | Shows the value without letting it change.                   |
| `class`         | `string`                               | -           | Merged onto the input.                                       |
| `groupClass`    | `string`                               | -           | Merged onto the bordered group.                              |
| `handleClass`   | `string`                               | -           | Merged onto the handle.                                      |
| `handle`        | `Snippet<[{ label, scrubbing }]>`      | -           | Replaces the handle's contents.                              |

## Keyboard

| Key                     | Does                                     |
| ----------------------- | ---------------------------------------- |
| `↑` / `↓`               | Step by `step`                           |
| `Shift` + `↑` / `↓`     | Step by `largeStep`                      |
| `Page Up` / `Page Down` | Step by `largeStep`                      |
| `Home` / `End`          | Jump to `min` / `max`, when bounded      |
| `Escape`                | Put back the value the field already had |

`←` and `→` are left alone: in a text field they move the caret, and taking that away makes the
number awkward to edit. So are `Home` and `End` while there is no `min` or `max` to jump to, and
`Escape` while there is no edit to put back - the first Escape is the field's, the second is the
dialog's around it, the rule `search-input` and `inline-edit` follow too.

## The screen edge

A drag ends where the screen does. The web's answer to that is Pointer Lock, and desktop design
tools use it to sweep a value as far as the hand goes. In a browser it also reports movement
inconsistently once a drag is under way, warping the pointer back and forth and reporting each warp
as hundreds of pixels nobody moved. Measured here, that is a number that jumps to its bound
mid-drag, so the drag stays on plain coordinates, which are exact.

For a longer sweep: hold Shift, lower `pixelsPerStep`, or type the number.

## Accessibility

The field is a native `input type="number"`, announced as a spinbutton with its `min`, `max` and
`step`, and named by the handle through a real `<label for>`. The handle is not focusable and
carries no role of its own: the keyboard already steps the field, and a second control for the same
number would be a second tab stop that adds nothing. Pointer dragging is an extra the pointer gets,
not the only way in.

Stepping is handled rather than left to the browser, because engines disagree on what Shift and the
paging keys do to a number input, and the coarse modifier has to mean the same thing as it does on
the handle.

## scrub.ts

The drag arithmetic is exported on its own, so the same sweep can drive something that is not a
field - a canvas handle, a zoom control:

```ts
import { consume } from '$lib/components/coral/kit/scrub-input/scrub.js';

let rest = 0;
const taken = consume(rest + event.movementX, 2);
rest = taken.rest; // carried, so a one-pixel move is not lost
zoom += taken.steps;
```

The clamping and rounding come from [`lib/number`](/docs/kit/number-input), shared with the number
input so both fields land on the same values.
