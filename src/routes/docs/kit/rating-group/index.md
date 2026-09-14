---
title: Rating group
description: Stars you can pick and stars you can only read. Native radios underneath, so the keyboard, the form and the screen reader come for free.
---

<script lang="ts">
	import Preview from '$lib/docs/preview.svelte';
</script>

<Preview name="kit/rating-group/basic" />

Flat props, because a rating has a defensible canonical case: some stars, a value, click one. The
compound alternative - a root, a control, a context, an each, an item - is eight lines of ceremony
to draw five stars, and it is the boilerplate Coral exists to delete.

## What Coral adds

- **Native radios underneath.** Arrow keys, `Home`/`End`, roving focus, form submission and
  `required` validation are the platform's, not a reimplementation of the platform's.
- **Right-to-left works without a `dir` prop.** The halves swap, the fill grows the other way, and
  the arrow keys reverse - the browser and CSS logical properties do all three.
- **Half stars from one glyph.** No second icon, and any fraction, not just a half.
- **`readonly` is not a disabled control.** It leaves the tab order and becomes an image with the
  rating as its name, which is what showing someone else's average actually is.
- **An average is drawn where it is.** `4.3` is four stars and a third.

## Halves

<Preview name="kit/rating-group/half" />

`allowHalf` doubles the options rather than adding a mode: five choices become ten, each star gets
two hit areas, and the keyboard steps by a half because there is genuinely another radio there.

## Reading, not rating

<Preview name="kit/rating-group/readonly" />

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

## Icons

<Preview name="kit/rating-group/icons" />

One `star` snippet, not three. It is rendered **twice per star** - once as the track with `fill: 0`,
once clipped to the real fill - so a custom shape keeps its half steps with no half-shaped glyph to
draw:

```svelte
{#snippet star({ index, fill })}
	{fill > 0 ? '🩻' : '🦴'}
{/snippet}
```

The usual build asks for `empty`, `half` and `full`. Three glyphs is three chances for them to
disagree, the half one only ever fits one shape, and it caps the component at halves - `4.3` has no
glyph. Clipping one shape has none of those problems.

Fill is a **fraction**, `0` to `1`, not a state. `fill > 0` is the "is this one earned" test.

## Colour and size

```svelte
<RatingGroup bind:value color="var(--chart-2)" class="[--coral-star:1.75rem]" />
```

<Preview name="kit/rating-group/scale" />

`color` and `emptyColor` are the two ends; both default to theme tokens, and passing a literal is
the project's call. `--coral-star` is the size, a custom property rather than a prop because a star
is sized, not styled - everything else in the row derives from it. The gap is a plain `gap-*` on
`class`.

## Forms

<Preview name="kit/rating-group/form" />

**`name` is what puts the rating in the request.** With it you get a real radio group: the value is
posted, `required` blocks submission natively, and the browser's own validation message points at
the control.

Without it, nothing is submitted at all - and that takes explaining, because radios need a name to
group _whatever_ they are for:

- Radios with no shared `name` are each a group of one. Arrow keys do nothing, and two stars can be
  checked at the same time.
- So Coral always sets one. A generated name would then be posted under a meaningless key.
- So a rating the caller did not name is pointed at a form that does not exist. A control with no
  form owner is never submitted, which leaves `name` meaning exactly one thing.

`required` needs `name` for the same reason: an unowned control is not validated by any form.

## Accessibility

Each star is a `<label>` wrapping an `sr-only` radio, so it is a real radio group and everything
below is the platform's behaviour, not an imitation of it:

| Key             | Does                             |
| --------------- | -------------------------------- |
| `Tab`           | enters at the checked star, once |
| `←` `→` `↑` `↓` | moves and selects                |
| `Home` `End`    | first, last                      |

The group needs a name. Either pass `aria-label`, or point `aria-labelledby` at a `Field.Legend` the
way the form example does. Each option names itself `3 / 5` - wordless, because `3 out of 5 stars`
is copy and copy is the project's. `label` is where that goes:

```svelte
<RatingGroup bind:value label={(value, count) => `${value} de ${count} estrellas`} />
```

<Preview name="kit/rating-group/states" />

## Installation

Nothing to add - the component uses no shadcn primitives.

```svelte
<script lang="ts">
	import RatingGroup from '$lib/coral/kit/rating-group/rating-group.svelte';
</script>
```

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
| `locale`     | `string`                          | `es-CO`                   | The number in the default label.                    |
| `color`      | `string`                          | `var(--primary)`          | The filled part.                                    |
| `emptyColor` | `string`                          | `var(--muted-foreground)` | The rest.                                           |
| `label`      | `(value, count) => string`        | `4,3 / 5`                 | Names one option, and the whole `readonly` control. |
| `onchange`   | `(value: number) => void`         | -                         | Never on mount.                                     |
| `onhover`    | `(value: number \| null) => void` | -                         | `null` when the pointer leaves.                     |
| `ref`        | `HTMLDivElement \| null`          | `null`                    | Bindable. The root element.                         |
| `class`      | `string`                          | -                         | Merged onto the root. Carries the size knob.        |
| `starClass`  | `string`                          | -                         | Merged onto every star.                             |
| `star`       | `Snippet<[{ index, fill }]>`      | Lucide star               | Replaces the glyph.                                 |

Everything else lands on the root element.

## What it does not do

- **No clearing by clicking the current star.** Native radios cannot be unchecked, and the extra
  hidden radio it would take needs a label, which is copy. Bind `value` and set it to `0`.
- **No `dir` prop.** Direction belongs to the document; the component reads it from CSS.
- **No label of its own.** `Field.Set` and `Field.Legend` already do that, and a second way to do it
  would be the syntactic sugar Coral is supposed to leave out.
