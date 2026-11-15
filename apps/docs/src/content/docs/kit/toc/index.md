---
title: Table of contents
description: A table of contents that highlights the section being read, including the last one.
group: Kit
category: Navigation
---

<script lang="ts">
	import Preview from '#lib/features/docs/components/Preview.svelte';
	import basicDemo from './demos/basic.svelte?demo';
	import givenDemo from './demos/given.svelte?demo';
</script>

The hand-rolled version tracks the active heading with an `IntersectionObserver` and takes
whichever entry reports itself as visible, which answers "what is on screen" when the question is
"what have I scrolled past". This site's own sidebar still does it that way, and shows both holes:
a section short enough to sit entirely above the band never lights up, and the last heading on a
page can never win at all, because at the bottom of the document there is nothing left to scroll
and it never crosses the line.

<Preview demo={basicDemo} class="min-h-80" />

## When to use

**Use it when**

- A long page is read top to bottom and the reader wants to see where they are: docs, a changelog,
  a long settings page.
- The headings come from markdown or a CMS and may have no ids yet.
- The article scrolls inside a panel rather than the window.

**Reach for something else when**

- The links go to other pages, not sections of this one: a shadcn `Sidebar` or a nav menu.
- The page is a sequence of steps the reader completes in order: [Stepper](/docs/kit/stepper).
- The reader needs the way back up a hierarchy: [Breadcrumbs](/docs/kit/breadcrumbs).

## Usage

```svelte
<script lang="ts">
	import Toc from '#lib/components/coral/kit/toc/toc.svelte';
</script>

<article>
	<h2>Environments</h2>
	<h2>API keys</h2>
	<h3>Rotating a key</h3>
	<h2>Webhooks</h2>
</article>

<Toc />
```

With no `headings`, it reads `h2, h3` from the document. Headings without an `id` get a slugged
one (accents folded, repeats numbered), so a table of contents over markdown or CMS HTML links
somewhere.

## Examples

### Headings you already have

<Preview demo={givenDemo} />

Pass `headings` and nothing is read from the DOM. That's the right shape when a markdown pipeline
or a CMS payload already lists them, and the ids are its doing.

### Offset

`offset` is how far below the top of the box a heading counts as reached. Set it to the height of a
sticky header, or a heading parked underneath one still counts as unread. It pairs with
`scroll-margin-top` on the headings themselves, which is what keeps the jump from putting the
heading under that same header.

### A scrolling panel

Pass `root` and it follows that box instead of the window: the active heading is measured against
the top of the box, and the end of the box counts as the end of the page.

### Too few headings

Below `minHeadings` (two by default) the component renders nothing at all, so a short page shows
no table of contents rather than one with a single entry.

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
| `label`          | `string`                    | `On this page`  | Names the navigation and is rendered above the list.       |
| `class`          | `string`                    | -               | Merged onto the `<nav>`. Carries `[--coral-toc-indent:…]`. |
| `itemClass`      | `string`                    | -               | Merged onto every link.                                    |
| `heading`        | `Snippet`                   | -               | Replaces the default label rendered above the list.        |
| `item`           | `Snippet<[TocItemContext]>` | -               | Replaces each link. Spread `props`.                        |

## Keyboard

Every entry is a real link: `Tab` walks them and `Enter` follows one. After a smooth jump, focus
moves to the heading, so the next `Tab` continues from that section rather than from the top of the
page. A link pressed with `Ctrl`, `Meta`, `Shift` or `Alt` is left to the browser.

## Accessibility

A `<nav>` with an accessible name and a list of real links, so it is reachable as a landmark and
every entry works with the keyboard, with middle-click and with "open in new tab". The active link
carries `aria-current="location"`, because the section is where the reader is inside this document,
not a different page.

Under `prefers-reduced-motion`, the click is left to the browser: it jumps, moves focus into the
section and writes the hash, which is exactly the behaviour to fall back to.

- **Focus follows a smooth scroll.** The heading is made focusable with `tabindex="-1"` only for as
  long as it holds focus, so no tab stop is added.
- **The hash is kept.** A smooth jump still writes `#id` to the address, so the section can be
  linked to and reloaded.

## Customizing

- **Class props.** `class` merges onto the `<nav>`, where `--coral-toc-indent` sets how far each
  level is indented; `itemClass` merges onto every link.
- **Snippets.** `heading` replaces the label above the list. `item` replaces each link and receives
  the `heading`, whether it is `active`, its `depth` and the `props` to spread onto your own `<a>`:
  `href`, `aria-current` and the click handler that does the smooth jump.
- **Project-wide defaults.** `label` can be stated once under `'kit/toc'` with `setCoralDefaults`:
  see [Project-wide defaults](/docs/conventions#project-wide-defaults).

The default links draw the familiar reading line: a vertical guide runs the length of the list,
and the active segment picks up the theme's primary color, the same shape as the outline on
Vercel, Next.js and shadcn's own docs, built from `border-primary` rather than anything hardcoded.

### Position, not intersection

The active heading is the last one past the boundary, measured on scroll. Short sections work, and
entries arriving out of order cannot confuse it. The last section is reachable too: at the bottom
of the page or panel the final heading is active, which no boundary rule alone can produce.

### headings.ts

`slug`, `uniqueId` and `pickActive` are exported on their own. `pickActive` is the whole
scroll-spy rule, and it is a pure function over numbers:

```ts
import { pickActive } from '#lib/components/coral/kit/toc/headings.js';

pickActive([-260, 40, 540], 80); // 1 - the last heading above the boundary
pickActive([-900, -600, -100], 80, true); // 2 - at the end of the page, the last one
```
