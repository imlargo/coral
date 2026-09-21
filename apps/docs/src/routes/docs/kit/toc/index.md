---
title: Table of contents
description: A table of contents that highlights the section being read, including the last one.
---

<script lang="ts">
	import Preview from '$docs/preview.svelte';
</script>

The hand-rolled version tracks the active heading with an `IntersectionObserver` and takes
whichever entry reports itself as visible, which answers "what is on screen" when the question is
"what have I scrolled past". This site's own sidebar still does it that way, and shows both holes:
a section short enough to sit entirely above the band never lights up, and the last heading on a
page can never win at all, because at the bottom of the document there is nothing left to scroll
and it never crosses the line.

<Preview name="kit/toc/basic" class="min-h-80" />

## What Coral adds

- **Position, not intersection:** the active heading is the last one past the boundary, measured on
  scroll. Short sections work, and entries arriving out of order cannot confuse it.
- **The last section is reachable.** At the bottom of the page or panel the final heading is active,
  which no boundary rule alone can produce.
- **Anchors that exist:** headings without an `id` get a slugged one (accents folded, repeats
  numbered), so a table of contents over markdown or CMS HTML links somewhere.
- **Scrolls inside a panel too.** Pass `root` and it follows that box instead of the window.
- **Focus follows a smooth scroll.** After a smooth jump the heading is focused, so the next Tab
  continues from the section rather than from the top of the page.

## Headings you already have

<Preview name="kit/toc/given" />

Pass `headings` and nothing is read from the DOM. That's the right shape when a markdown pipeline
or a CMS payload already lists them, and the ids are its doing.

## Offset

`offset` is how far below the top of the box a heading counts as reached. Set it to the height of a
sticky header, or a heading parked underneath one still counts as unread. It pairs with
`scroll-margin-top` on the headings themselves, which is what keeps the jump from putting the
heading under that same header.

## Installation

No shadcn primitives.

```svelte
<script lang="ts">
	import Toc from '$lib/components/coral/kit/toc/toc.svelte';
</script>
```

## Props

Everything a `<nav>` accepts stays available. On top of that:

| Prop             | Type                        | Default         | Description                                                |
| ---------------- | --------------------------- | --------------- | ---------------------------------------------------------- |
| `headings`       | `TocHeading[]`              | read from DOM   | `{ id, text, level }`. Omit to collect them.               |
| `container`      | `HTMLElement \| null`       | `document.body` | Where headings are read from.                              |
| `selector`       | `string`                    | `h2, h3`        | Which elements count.                                      |
| `root`           | `HTMLElement \| null`       | the window      | The scrolling box the article lives in.                    |
| `offset`         | `number`                    | `80`            | Pixels below the top where a heading counts as reached.    |
| `active`         | `string`                    | -               | Bindable id of the active heading.                         |
| `onactivechange` | `(id: string) => void`      | -               | The active heading changed.                                |
| `smooth`         | `boolean`                   | `true`          | Smooth scroll on click. Ignored under reduced motion.      |
| `minHeadings`    | `number`                    | `2`             | Renders nothing below this many headings.                  |
| `label`          | `string`                    | `On this page`  | Names the navigation.                                      |
| `class`          | `string`                    | -               | Merged onto the `<nav>`. Carries `[--coral-toc-indent:…]`. |
| `itemClass`      | `string`                    | -               | Merged onto every link.                                    |
| `heading`        | `Snippet`                   | -               | Rendered above the list.                                   |
| `item`           | `Snippet<[TocItemContext]>` | -               | Replaces each link. Spread `props`.                        |

## Accessibility

A `<nav>` with an accessible name and a list of real links, so it is reachable as a landmark and
every entry works with the keyboard, with middle-click and with "open in new tab". The active link
carries `aria-current="location"`, because the section is where the reader is inside this document,
not a different page.

Under `prefers-reduced-motion`, the click is left to the browser: it jumps, moves focus into the
section and writes the hash, which is exactly the behaviour to fall back to.

## headings.ts

`slug`, `uniqueId` and `pickActive` are exported on their own. `pickActive` is the whole
scroll-spy rule, and it is a pure function over numbers:

```ts
import { pickActive } from '$lib/components/coral/kit/toc/headings.js';

pickActive([-260, 40, 540], 80); // 1 - the last heading above the boundary
pickActive([-900, -600, -100], 80, true); // 2 - at the end of the page, the last one
```
