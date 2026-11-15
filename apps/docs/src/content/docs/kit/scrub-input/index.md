---
title: Scrub input
description: A number field whose label is a drag handle - drag it, type it, or step it with the arrow keys.
group: Kit
---

<script lang="ts">
	import Preview from '#lib/features/docs/components/Preview.svelte';
	import basicDemo from './demos/basic.svelte?demo';
	import boundsDemo from './demos/bounds.svelte?demo';
	import historyDemo from './demos/history.svelte?demo';
</script>

Inspector panels are made of number fields, and reaching for a stepper twenty times to find the
right padding is not how anyone wants to find it. Every design tool answers the same way: the label
beside the number is a handle, and dragging it sweeps through the range. The hand-rolled version is
a `pointermove` listener that reads `clientX`, and it has three holes: dragging selects the label
text, slow drags of a pixel at a time round to nothing, and there is no way back once the pointer
has started moving.

Coral closes all three. Distance too short for a step is carried to the next move instead of being
rounded away, so a careful drag moves the number as reliably as a fast one. The drag selects no
text, and Escape mid-drag returns the value to what it was when the drag began.

<Preview demo={basicDemo} class="min-h-72" />

## When to use

**Use it when**

- A dozen numbers sit in a column and are adjusted by feel: an inspector, a settings panel for a
  chart, a canvas editor.
- Each field has a short name that can double as the handle: `W`, `Opacity`, `Timeout`.
- An editor needs one undo entry per drag rather than per step.

**Reach for something else when**

- The number sits in a form, read once and typed into: [Number input](/docs/kit/number-input)
  gives it `−` and `+` buttons, currency and percent formatting.
- Where the value sits in its range matters more than its exact figure: shadcn's `Slider`.

## Usage

```svelte
<script lang="ts">
	import ScrubInput from '#lib/components/coral/kit/scrub-input/scrub-input.svelte';

	let timeout = $state(3000);
</script>

<ScrubInput label="Timeout" bind:value={timeout} min={0} max={30000} step={100} suffix="ms" />
```

## Examples

### Bounds, steps and units

<Preview demo={boundsDemo} class="min-h-64" />

`step` sets both the jump and the precision, so `step={0.05}` rounds to two decimals; `largeStep`
is what Shift uses, and defaults to ten times `step`. `pixelsPerStep` is the sensitivity: at `1` the
number follows the pointer pixel for pixel, which is what a field measured in pixels wants, while a
field measured in milliseconds usually wants more travel per step.

Bounds hold from every direction: the drag, the arrow keys and a typed number all clamp on commit.
Clamping only on commit is deliberate - with a max of `30000`, the `3` and the `300` of `30000` are
both fine on the way, and only the finished number can be wrong.

Shift is coarse everywhere, on the handle and on the arrow keys alike, which is one rule to learn
rather than two.

### One drag, one undo

<Preview demo={historyDemo} class="min-h-80" />

A drag is one action. `onscrubstart` and `onscrubend` bracket it, so an editor records one undo
entry per drag rather than one per step. `onscrubend` fires for a cancelled drag too, with the value
it was put back to.

### Readonly and disabled

Both stop the drag and the keys, and the handle's cursor goes back to the default. `disabled` also
stops a click on the handle from focusing the field.

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
| `locale`        | `string`                               | `en-US`     | How the number is typed and shown - see number input.        |
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

With focus in the field, and while a drag is under way:

| Key                     | Action                                           |
| ----------------------- | ------------------------------------------------ |
| `↑` / `↓`               | Steps by `step`.                                 |
| `Shift` + `↑` / `↓`     | Steps by `largeStep`.                            |
| `Page Up` / `Page Down` | Steps by `largeStep`.                            |
| `Home` / `End`          | Jumps to `min` / `max`, when bounded.            |
| `Enter`                 | Commits what was typed, clamped to the bounds.   |
| `Escape`                | Puts back the value the field already had.       |
| `Shift` while dragging  | Each step of the drag moves by `largeStep`.      |
| `Escape` while dragging | Ends the drag and returns the value it began at. |

`←` and `→` are left alone: in a text field they move the caret, and taking that away makes the
number awkward to edit. So are `Home` and `End` while there is no `min` or `max` to jump to, and
`Escape` while there is no edit to put back - the first Escape is the field's, the second is the
dialog's around it, the rule `search-input` and `inline-edit` follow too.

## Accessibility

The field is a text input with `role="spinbutton"`, announcing its value and bounds through the
`aria-value*` attributes, and named by the handle through a real `<label for>`. It is a text field
for the reason [number input](/docs/kit/number-input#locale) gives: a `type="number"` field drops a
decimal comma, and most of the world writes one. The handle is not focusable and carries no role of
its own: the keyboard already steps the field, and a second control for the same number would be a
second tab stop that adds nothing. Pointer dragging is an extra the pointer gets, not the only way
in.

- **The label is a label.** A plain click on it focuses the field and selects the number, ready to
  be typed over. Dragging does not steal that focus, and does not select text on the way.
- **The drag survives the pointer leaving.** It is captured, so a fast sweep that runs off the
  handle, or off the field entirely, keeps driving the number until the button comes up.

Stepping is handled rather than left to the browser, because engines disagree on what Shift and the
paging keys do to a number input, and the coarse modifier has to mean the same thing as it does on
the handle. The handler is the one number input uses, in `lib/number-field.ts`.

## Customizing

`class` lands on the input, `groupClass` on the bordered group around the handle, the field and the
suffix, and `handleClass` on the handle. The `handle` snippet replaces the handle's contents (an
icon, an axis glyph) and receives `scrubbing`, which is also on the handle as `data-scrubbing`
while a drag is under way. The handle stays a `<label>` whatever the snippet draws.

The only project-wide default it reads is the shared `locale` from
[`setCoralDefaults`](/docs/conventions#project-wide-defaults). A caller's `onkeydown` runs before
the component's, so calling `preventDefault` on it takes that key away from the stepping.

### scrub.ts

The drag arithmetic is exported on its own, so the same sweep can drive something that is not a
field - a canvas handle, a zoom control:

```ts
import { consume } from '#lib/components/coral/kit/scrub-input/scrub.js';

let rest = 0;
const taken = consume(rest + event.movementX, 2);
rest = taken.rest; // carried, so a one-pixel move is not lost
zoom += taken.steps;
```

The clamping and rounding come from [`lib/number`](/docs/kit/number-input), shared with the number
input so both fields land on the same values. Dropping to a raw shadcn `input-group` means writing
back the pointer capture, the carried distance, the Escape that reverts a drag, the commit-time
clamp and the spinbutton attributes.

## The screen edge

A drag ends where the screen does. The web's answer to that is Pointer Lock, and desktop design
tools use it to sweep a value as far as the hand goes. In a browser it also reports movement
inconsistently once a drag is under way, warping the pointer back and forth and reporting each warp
as hundreds of pixels nobody moved. Measured here, that is a number that jumps to its bound
mid-drag, so the drag stays on plain coordinates, which are exact.

For a longer sweep: hold Shift, lower `pixelsPerStep`, or type the number.
