---
title: Breadcrumbs
description: A trail that fits on one line at any width, folding its middle into a menu, with the current page marked as the current page.
group: Kit
---

<script lang="ts">
	import Preview from '#lib/features/docs/components/Preview.svelte';
</script>

shadcn-svelte's `breadcrumb` ships the parts, an ellipsis included, and no behaviour: when and how a
trail shortens is left to every project, and most never decide. A deep trail wraps onto two lines
or shrinks every crumb into an unreadable stub, the current page is drawn as a link to itself, and
a long repository name pushes everything else off the screen.

<Preview name="kit/breadcrumbs/basic" />

## What Coral adds

- **It fits.** The trail is measured against the room it has and the middle is folded into a menu,
  as many crumbs as it takes and no more. Give the window back and they come back.
- **Both ends stay.** The root and the current page are never folded, because a trail that has lost
  where it starts or where it is has stopped being a trail. A long name on either end truncates, and
  keeps its full text in the title.
- **Every page stays reachable.** The folded pages are links in the menu, in order, with their names
  in full.
- **The current page is the current page.** It is marked `aria-current="page"` and not linked, which
  is what the primitive's `Page` part is for.

## Folding

<Preview name="kit/breadcrumbs/folded" class="min-h-32" />

Resize the preview, or the window. The whole trail is measured off an invisible copy, so the shown
trail never has to change shape to find out whether it fits, and the fold runs from the second
crumb forward: what disappears first is the middle of the path, and what stays is the root, the
fold, and the pages nearest to where the reader is.

## Your own crumbs

<Preview name="kit/breadcrumbs/custom" />

The `item` snippet replaces what a crumb shows (an icon beside the root, a status dot) and the
link or the current-page mark stays around it. `separator` replaces the glyph between crumbs.

## Import

```svelte
<script lang="ts">
	import Breadcrumbs from '#lib/components/coral/kit/breadcrumbs/breadcrumbs.svelte';
	import type { Crumb } from '#lib/components/coral/kit/breadcrumbs/types.js';
</script>
```

## Props

Everything the shadcn breadcrumb root accepts stays available: `class`, `aria-*`, `ref`. On top of
that:

| Prop          | Type                                   | Default                 | Description                                  |
| ------------- | -------------------------------------- | ----------------------- | -------------------------------------------- |
| `items`       | `Crumb[]`                              | -                       | The trail, root first. The last is the page. |
| `foldedLabel` | `string`                               | `Show the folded pages` | Accessible name of the fold control.         |
| `class`       | `string`                               | -                       | Merged onto the `<nav>`.                     |
| `listClass`   | `string`                               | -                       | Merged onto the list.                        |
| `item`        | `Snippet<[{ crumb, index, current }]>` | -                       | Replaces what a crumb shows.                 |
| `separator`   | `Snippet`                              | -                       | Replaces the separator.                      |

### Crumb

| Field   | Type     | Description                                           |
| ------- | -------- | ----------------------------------------------------- |
| `label` | `string` | What the crumb says, and the title when it truncates. |
| `href`  | `string` | Where it goes. The current page needs none.           |

## Accessibility

The `<nav>` is the primitive's, named `breadcrumb`, and the trail is an ordered list, so a screen
reader hears how deep it is. The current page carries `aria-current="page"`. The fold is a real
button with `foldedLabel` as its name, and it opens a menu of links the arrow keys walk, so no page
is reachable by mouse alone. The measuring copy is `aria-hidden` and invisible: it exists for the
measurement and for nothing else.
