---
title: Color picker
description: A colour from a square, a hue strip, a hex or a swatch - bound as the hex a server stores, and reachable from the keyboard on every part.
group: Kit
---

<script lang="ts">
	import Preview from '#lib/features/docs/components/Preview.svelte';
	import basicDemo from './demos/basic.svelte?demo';
	import swatchesDemo from './demos/swatches.svelte?demo';
	import panelDemo from './demos/panel.svelte?demo';
	import formDemo from './demos/form.svelte?demo';
</script>

`<input type="color">` opens a different dialog in every browser, cannot offer the project's own
colours, and cannot be put inside a popover. The hand-built replacement is a square and a strip
that only a mouse can move, a hex field that throws away `#38f`, and a hue that snaps back to red
the moment the thumb touches the grey edge of the square.

<Preview demo={basicDemo} />

## What Coral adds

- **Every part works from the keyboard.** The square is a slider whose arrows move saturation across
  and brightness up and down, the strip is a slider for hue, Shift moves ten times as far, and both
  say what they are set to: `Saturation 60%, brightness 40%`.
- **The hue holds.** The panel keeps the colour at full precision while it is being moved, so a grey
  or a black keeps the hue it was dragged from, also when the popover is opened again, and the thumb
  never drifts by rounding to a hex.
- **A hex in any spelling.** `#3B82F6`, `3b82f6` and `#38f` are all read, and the value is always
  written one way: `#3b82f6`. A typo puts the colour back on blur instead of clearing it.
- **Escape undoes before it closes.** The first Escape in the hex field puts back what was there; the
  next one closes the popover.
- **The eyedropper where there is one.** A button picks a colour from anywhere on the screen in the
  browsers that have the EyeDropper API, and is left out in the others rather than drawn disabled.
- **A save per gesture.** `bind:value` follows every pointer move; `onchange` fires once, when a drag
  lets go, a key moves the thumb, a hex is committed or a swatch is picked.

## Swatches

<Preview demo={swatchesDemo} />

`swatches` takes hex strings, or `Option<string>` from [lib/options](/docs/conventions#types) when a
colour needs a name: a screen reader hears `Teal` instead of `#0d9488`. They are native radios, so
the arrow keys move through them and the one matching the value is checked.

## The panel on its own

<Preview demo={panelDemo} />

`ColorPanel` is the editor without the popover, for a settings page with room for it. `ColorArea`
and `HueSlider` are the two sliders inside it, for a layout of your own:

```svelte
<script lang="ts">
	import ColorArea from '#lib/components/coral/kit/color-picker/color-area.svelte';
	import HueSlider from '#lib/components/coral/kit/color-picker/hue-slider.svelte';

	let hue = $state(210);
	let saturation = $state(0.7);
	let brightness = $state(0.9);
</script>

<ColorArea {hue} bind:saturation bind:brightness />
<HueSlider bind:value={hue} />
```

They take HSV, because those are the three things the reader moves. `color.ts` converts:
`hsvToHex`, `hexToHsv` and `parseHex`.

## Forms

<Preview demo={formDemo} />

With `name`, the picker submits the hex through a field the browser validates, so `required` blocks
an empty submit with the browser's own message. The trigger takes `id` and `aria-*`, so a `<Label
for>` names it.

## Accessibility

| Key                   | On the square       | On the strip     |
| --------------------- | ------------------- | ---------------- |
| `←` `→`               | saturation          | hue              |
| `↑` `↓`               | brightness          | hue              |
| `Page Up` `Page Down` | brightness, by ten  | hue, by ten      |
| `Home` `End`          | no saturation, full | first, last      |
| `Shift` with an arrow | ten times as far    | ten times as far |

Opening the popover puts focus on the square, ready for the arrows. The arrows follow the picture,
not the reading direction: the square and the strip are drawn left to right in every language.

The picker needs a name, from a `<Label for>`, `aria-label` or `aria-labelledby`. The words inside
it are props with English defaults, and can come from [project defaults](/docs/conventions#project-wide-defaults).

## Import

```svelte
<script lang="ts">
	import ColorPicker from '#lib/components/coral/kit/color-picker/color-picker.svelte';
</script>
```

## Props

### Color picker

Everything the panel takes, below, plus:

| Prop           | Type                                                    | Default         | Description                                   |
| -------------- | ------------------------------------------------------- | --------------- | --------------------------------------------- |
| `open`         | `boolean`                                               | `false`         | Bindable.                                     |
| `onOpenChange` | `(open: boolean) => void`                               | -               | The popover opened or closed.                 |
| `placeholder`  | `string`                                                | `Pick a colour` | Printed on the trigger while there is none.   |
| `name`         | `string`                                                | -               | Submits the hex.                              |
| `form`         | `string`                                                | -               | `id` of the form, for a picker outside it.    |
| `required`     | `boolean`                                               | `false`         | Needs `name`.                                 |
| `align`        | `'start' \| 'center' \| 'end'`                          | `start`         | Which trigger edge the popover lines up with. |
| `id`           | `string`                                                | generated       | Put on the trigger, for a `<Label for>`.      |
| `aria-*`       | `aria-label`, `-labelledby`, `-describedby`, `-invalid` | -               | Put on the trigger.                           |
| `ref`          | `HTMLButtonElement \| null`                             | `null`          | Bindable. The trigger.                        |
| `class`        | `string`                                                | -               | Merged onto the trigger.                      |
| `contentClass` | `string`                                                | -               | Merged onto the popover.                      |

| Snippet    | Receives                           | Replaces                     |
| ---------- | ---------------------------------- | ---------------------------- |
| `trigger`  | `{ props, value, open, disabled }` | The trigger. Spread `props`. |
| `children` | -                                  | Rendered under the panel.    |

### Color panel

| Prop              | Type                                 | Default                          | Description                                                |
| ----------------- | ------------------------------------ | -------------------------------- | ---------------------------------------------------------- |
| `value`           | `string`                             | -                                | Bindable. `#rrggbb`, live while dragging.                  |
| `hue`             | `number`                             | -                                | Bindable. The hue it is on, kept for a grey that has none. |
| `onchange`        | `(value: string) => void`            | -                                | Once per gesture. Never for code.                          |
| `swatches`        | `(string \| Option<string>)[]`       | `[]`                             | Preset colours.                                            |
| `disabled`        | `boolean`                            | `false`                          | Blocks every part.                                         |
| `locale`          | `string`                             | `en-US`                          | The numbers a screen reader hears.                         |
| `areaLabel`       | `string`                             | `Saturation and brightness`      | Names the square.                                          |
| `areaValueText`   | `(saturation, brightness) => string` | `Saturation 60%, brightness 40%` | What the square says.                                      |
| `hueLabel`        | `string`                             | `Hue`                            | Names the strip.                                           |
| `hueValueText`    | `(hue: number) => string`            | `210 degrees`                    | What the strip says.                                       |
| `hexLabel`        | `string`                             | `Hex`                            | Names the hex field.                                       |
| `swatchesLabel`   | `string`                             | `Swatches`                       | Names the swatch group.                                    |
| `eyeDropperLabel` | `string`                             | `Pick a colour from the screen`  | Names the eyedropper.                                      |
| `class`           | `string`                             | -                                | Merged onto the panel.                                     |

### Color area and hue slider

| Prop         | Type         | Default  | Description                                                         |
| ------------ | ------------ | -------- | ------------------------------------------------------------------- |
| `hue`        | `number`     | -        | The area's hue, `0` to `360`. Required. Bindable only on the panel. |
| `saturation` | `number`     | `0`      | Bindable. The area, left to right, `0` to `1`.                      |
| `brightness` | `number`     | `0`      | Bindable. The area, bottom to top, `0` to `1`.                      |
| `oncommit`   | `() => void` | -        | A drag let go, or a key moved the thumb.                            |
| `label`      | `string`     | per part | Names the thumb: `Saturation and brightness`, `Hue`.                |
| `valueText`  | `function`   | per part | What the thumb says, as on the panel.                               |
| `thumbClass` | `string`     | -        | Merged onto the thumb.                                              |

The hue slider's own `value` is the hue, bindable, as in the panel's table above. On every part,
everything else lands on the root element.

## What it does not do

- **No alpha.** A hex with transparency is rare in a product's settings and doubles what the panel
  has to explain. Pair the picker with a [number input](/docs/kit/number-input) if a project needs one.
- **No colour spaces beyond hex.** The value is the hex a server stores and a CSS variable takes.
  `hexToHsv` is there for a project that has to show another one.
- **No colour names.** A screen reader hears the position of each thumb, not "dark vibrant blue":
  naming colours well is a dictionary and a locale of its own. Name the swatches instead.
