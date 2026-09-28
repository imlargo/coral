---
title: Textarea
description: A textarea that grows with its text, up to a line count you set, with a counter that agrees with the limit.
---

<script lang="ts">
	import Preview from '$docs/preview.svelte';
</script>

A comment box that does not grow makes people write into a two-line window with a scrollbar, and a
comment box that grows without a ceiling pushes the button they are reaching for off the screen. The
hand-rolled fix is four lines - set the height to `auto`, read `scrollHeight`, set it back - and it
has three quiet problems: the page jumps as the field shrinks, the field loses a pixel a time in a
border-box layout, and none of it runs when the text arrives from anywhere other than a keystroke.

<Preview name="kit/textarea/basic" class="min-h-64" />

## What Coral adds

- **A floor and a ceiling, in lines.** `rows` is the shortest it gets, `maxRows` the tallest; past
  that it scrolls inside itself rather than pushing the page around.
- **The page does not jump.** The scroll position is held across the measurement, which is what a
  field being shrunk otherwise steals from a reader further down the page.
- **Right in a border box.** `scrollHeight` carries padding but never border, so a border-box field -
  every Tailwind project - has to add it back, or the text creeps under its own edge.
- **It re-measures when the field changes, not only when someone types:** text set from code, a
  narrower field that rewraps the text, a web font landing after first paint.
- **A counter that agrees with the limit.** Counted in UTF-16 units, the way `maxlength` counts, so
  the number and the field never disagree about what an emoji costs.
- **Send keys, without breaking input methods.** `enter` for a chat composer, `mod-enter` for a
  form, and neither fires mid-composition or on an empty field.

## A counter and a limit

<Preview name="kit/textarea/counter" class="min-h-64" />

Near the limit the counter takes the theme's destructive colour and the number left is announced
politely - once, near the end, rather than on every keystroke, which is what makes a counted field
usable with a screen reader on.

## A composer

<Preview name="kit/textarea/composer" class="min-h-80" />

`submitOn="enter"` is the chat convention: Enter sends, Shift-Enter writes a newline.
`submitOn="mod-enter"` is the form one, where Enter belongs to the text and Cmd or Ctrl sends. Both
leave an empty field alone, so Enter still does what Enter does.

## Import

```svelte
<script lang="ts">
	import Textarea from '$lib/components/coral/kit/textarea/textarea.svelte';
</script>
```

## Props

Everything the shadcn textarea accepts stays available - `name`, `id`, `placeholder`, `required`,
`disabled`, `aria-*`. On top of that:

| Prop        | Type                                         | Default | Description                                            |
| ----------- | -------------------------------------------- | ------- | ------------------------------------------------------ |
| `value`     | `string`                                     | `''`    | Bindable.                                              |
| `rows`      | `number`                                     | `2`     | Shortest the field gets, in lines.                     |
| `maxRows`   | `number`                                     | -       | Tallest. Past it the field scrolls.                    |
| `maxLength` | `number`                                     | -       | Enforced by the browser, and counted by the counter.   |
| `showCount` | `boolean`                                    | `false` | Shows how much of the limit is used.                   |
| `warnAt`    | `number`                                     | a tenth | How many characters from the limit the warning starts. |
| `submitOn`  | `'mod-enter' \| 'enter' \| false`            | `false` | Which keys send.                                       |
| `onsubmit`  | `(value: string) => void`                    | -       | Runs when they do. Never for an empty field.           |
| `class`     | `string`                                     | -       | Merged onto the textarea.                              |
| `counter`   | `Snippet<[{ count, left, limit, warning }]>` | -       | Replaces the counter.                                  |

The field carries `data-scrollable` once it is capped by `maxRows`, for a fade or a border that only
belongs there when there is more text below.

## Accessibility

A plain `<textarea>`, so everything the platform gives it stays: the accessible name from a label,
`required`, `disabled`, the native limit. The counter is wired to the field with `aria-describedby`,
so it is read as part of the field rather than as a stray number, and the announcement near the
limit is polite and only fires inside the warning zone.

## What is deliberately not here

Rich text, mentions, a markdown preview and a slash-command menu. Each of those is a composition
with an opinion about your content and your data; this component is the field they would be built
on.

## measure.ts

The arithmetic is exported on its own, so anything else that has to size a field the same way can:

```ts
import { countOf, heightFor } from '$lib/components/coral/kit/textarea/measure.js';

countOf('🚀'); // 2 - what `maxlength` spends on it
heightFor({
	scrollHeight: 96,
	lineHeight: 20,
	padding: 16,
	border: 2,
	borderBox: true,
	minRows: 2
});
// { height: 98, scrollable: false }
```
