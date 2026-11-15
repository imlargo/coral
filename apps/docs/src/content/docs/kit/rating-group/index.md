---
title: Rating group
description: Stars you can pick and stars you can only read. Native radios underneath, so the keyboard, the form and the screen reader come for free.
group: Kit
category: Inputs
---

<script lang="ts">
	import Preview from '#lib/features/docs/components/Preview.svelte';
	import basicDemo from './demos/basic.svelte?demo';
	import halfDemo from './demos/half.svelte?demo';
	import readonlyDemo from './demos/readonly.svelte?demo';
	import iconsDemo from './demos/icons.svelte?demo';
	import scaleDemo from './demos/scale.svelte?demo';
	import formDemo from './demos/form.svelte?demo';
	import statesDemo from './demos/states.svelte?demo';
</script>

A row of star buttons with click handlers is the usual build, and it leaves out the keyboard, the
form and the screen reader: arrow keys do nothing, a required rating cannot hold back a submit, and
a screen reader hears five unnamed buttons. Half stars then need a second, half-shaped glyph that
only fits one shape.

Rating group puts a native radio under every star, so the keyboard, form submission and `required`
validation are the platform's, and draws any fraction of a star by clipping one glyph.

<Preview demo={basicDemo} />

## When to use

**Use it when**

- Someone rates something on a short scale of stars: a template, a support reply, a release.
- An average is shown as stars, unrounded, with `readonly`.
- The rating has to post with a form and block it while empty, through `name` and `required`.

**Reach for something else when**

- The scale is a number the reader picks precisely: [number input](/docs/kit/number-input), or
  [scrub input](/docs/kit/scrub-input) to drag it.
- The choices are words, not a scale: the shadcn `RadioGroup`, or a [select](/docs/kit/select).
- The value is a share of a whole, not a score: [gauge](/docs/kit/gauge).

## Usage

```svelte
<script lang="ts">
	import RatingGroup from '#lib/components/coral/kit/rating-group/rating-group.svelte';

	let value = $state(0);
</script>

<RatingGroup bind:value aria-label="Rate this template" />
```

## Examples

### Halves

<Preview demo={halfDemo} />

`allowHalf` doubles the options rather than adding a mode: five choices become ten, each star gets
two hit areas, and the keyboard steps by a half because there is genuinely another radio there.

### Reading, not rating

<Preview demo={readonlyDemo} />

`readonly` is the case that shows an average, and it is a different thing from a control nobody may
touch:

|                  | `readonly`        | `disabled`               |
| ---------------- | ----------------- | ------------------------ |
| In the tab order | no                | no                       |
| Exposed as       | an image          | a disabled control       |
| Value drawn      | exactly as-is     | rounded to a step        |
| Says             | this is the score | you can't rate right now |

Only `readonly` draws `value` unrounded, because only there is a fraction meaningful. A control has
to show what it would submit.

### Forms

<Preview demo={formDemo} />

**`name` is what puts the rating in the request.** With it you get a real radio group: the value is
posted, `required` blocks submission natively, and the browser's own validation message points at
the control.

Without it, nothing is submitted at all, and that takes explaining, because radios need a name to
group _whatever_ they are for:

- Radios with no shared `name` are each a group of one. Arrow keys do nothing, and two stars can be
  checked at the same time.
- So Coral always sets one. A generated name would then be posted under a meaningless key.
- So a rating the caller did not name is pointed at a form that does not exist. A control with no
  form owner is never submitted, which leaves `name` meaning exactly one thing.

`required` needs `name` for the same reason: an unowned control is not validated by any form.

### Disabled, read-only and right-to-left

<Preview demo={statesDemo} />

`disabled` keeps the stars in the page, dimmed and unclickable, as something that could have been
used. Right-to-left works without a `dir` prop: the halves swap, the fill grows the other way and
the arrow keys reverse, because the browser and CSS logical properties do all three.

### Icons

<Preview demo={iconsDemo} />

One `star` snippet, not three. It is rendered **twice per star** (once as the track with `fill: 0`,
once clipped to the real fill), so a custom shape keeps its half steps with no half-shaped glyph to
draw:

```svelte
{#snippet star({ index, fill })}
	{fill > 0 ? '🩻' : '🦴'}
{/snippet}
```

The usual build asks for `empty`, `half` and `full`. Three glyphs is three chances for them to
disagree, the half one only ever fits one shape, and it caps the component at halves. `4.3` has no
glyph. Clipping one shape has none of those problems.

Fill is a **fraction**, `0` to `1`, not a state. `fill > 0` is the "is this one earned" test.

### Colour and size

```svelte
<RatingGroup bind:value color="var(--chart-2)" class="[--coral-star:1.75rem]" />
```

<Preview demo={scaleDemo} />

`color` and `emptyColor` are the two ends; both default to theme tokens, and passing a literal is
the project's call. `--coral-star` is the size, a custom property rather than a prop because a star
is sized, not styled; everything else in the row derives from it. The gap is a plain `gap-*` on
`class`.

## Props

| Prop         | Type                              | Default                   | Description                                         |
| ------------ | --------------------------------- | ------------------------- | --------------------------------------------------- |
| `value`      | `number`                          | `0`                       | Bindable. `0` is unrated.                           |
| `count`      | `number`                          | `5`                       | How many stars.                                     |
| `allowHalf`  | `boolean`                         | `false`                   | Halves the step.                                    |
| `readonly`   | `boolean`                         | `false`                   | Draws the rating, offers nothing.                   |
| `disabled`   | `boolean`                         | `false`                   | Blocks the control.                                 |
| `required`   | `boolean`                         | `false`                   | Needs `name`.                                       |
| `name`       | `string`                          | -                         | Posts the rating. Without it, nothing is.           |
| `form`       | `string`                          | -                         | `id` of the form to post with.                      |
| `locale`     | `string`                          | `en-US`                   | The number in the default label.                    |
| `color`      | `string`                          | `var(--primary)`          | The filled part.                                    |
| `emptyColor` | `string`                          | `var(--muted-foreground)` | The rest.                                           |
| `label`      | `(value, count) => string`        | `4.3 / 5`                 | Names one option, and the whole `readonly` control. |
| `onchange`   | `(value: number) => void`         | -                         | Never on mount.                                     |
| `onhover`    | `(value: number \| null) => void` | -                         | `null` when the pointer leaves.                     |
| `ref`        | `HTMLDivElement \| null`          | `null`                    | Bindable. The root element.                         |
| `class`      | `string`                          | -                         | Merged onto the root. Carries the size knob.        |
| `starClass`  | `string`                          | -                         | Merged onto every star.                             |
| `star`       | `Snippet<[{ index, fill }]>`      | Lucide star               | Replaces the glyph.                                 |

Everything else lands on the root element.

## Keyboard

Each star is a native radio, so the group behaves like any radio group: one tab stop, and the arrow
keys move through it. `Home` and `End` are Coral's, because a native radio group leaves them out and
a half-step rating is ten options wide.

| Key             | Action                                                        |
| --------------- | ------------------------------------------------------------- |
| `Tab`           | Enters at the checked star, once.                             |
| `←` `→` `↑` `↓` | Moves and selects. In a right-to-left page, `←` and `→` swap. |
| `Space`         | Checks the focused star when none is checked yet.             |
| `Home` / `End`  | Selects the first step or the last star.                      |

A `readonly` rating leaves the tab order: it has no keys.

## Accessibility

Each star is a `<label>` wrapping an `sr-only` radio, so it is a real radio group and its
arrow keys, form behaviour and validation are the platform's, not an imitation of them.

The group needs a name. Either pass `aria-label`, or point `aria-labelledby` at a `Field.Legend` the
way the form example does. Each option names itself `3 / 5`, wordless, because `3 out of 5 stars`
is copy and copy is the project's. `label` is where that goes:

```svelte
<RatingGroup bind:value label={(value, count) => `${value} out of ${count} stars`} />
```

- **`readonly` is not a disabled control.** It leaves the tab order and becomes an image
  (`role="img"`) with the rating as its name, which is what showing someone else's average actually
  is.
- **Focus is drawn on the star.** The radio is visually hidden, so the focus ring is drawn on the
  star that holds it.

## Customizing

- `class` lands on the root and carries the size knob, `[--coral-star:2rem]`, and the gap.
  `starClass` is merged onto every star.
- `color` and `emptyColor` set the fill and the track; keep them theme tokens to stay themeable.
- `star` replaces the glyph, rendered twice per star, as shown under [Icons](#icons).
- `label` can be set once for the project with
  [`setCoralDefaults`](/docs/conventions#project-wide-defaults) under `kit/rating-group`, and the
  shared `locale` drives the number in the default label.

There is no shadcn rating to drop down to: the pieces are native radios and a Lucide star. The
arithmetic is in `rating.ts` beside the component (`fillOf`, `snap`, `stepsFor`); a hand-built
rating starts from there and rebuilds the detached form owner, `Home` and `End`, the clipped fill
and the read-only image.

### Why flat props

Flat props, because a rating has a defensible canonical case: some stars, a value, click one. The
compound alternative (a root, a control, a context, an each, an item) is eight lines of ceremony
to draw five stars, and it is the boilerplate Coral exists to delete.

### What it does not do

- **No clearing by clicking the current star.** Native radios cannot be unchecked, and the extra
  hidden radio it would take needs a label, which is copy. Bind `value` and set it to `0`.
- **No `dir` prop.** Direction belongs to the document; the component reads it from CSS.
- **No label of its own.** `Field.Set` and `Field.Legend` already do that, and a second way to do it
  would be the syntactic sugar Coral is supposed to leave out.
