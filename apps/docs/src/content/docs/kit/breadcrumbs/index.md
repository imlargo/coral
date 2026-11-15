---
title: Breadcrumbs
description: A trail that fits on one line at any width, folding its middle into a menu, with the current page marked as the current page.
group: Kit
category: Navigation
---

<script lang="ts">
	import Preview from '#lib/features/docs/components/Preview.svelte';
	import basicDemo from './demos/basic.svelte?demo';
	import foldedDemo from './demos/folded.svelte?demo';
	import customDemo from './demos/custom.svelte?demo';
</script>

shadcn-svelte's `breadcrumb` ships the parts, an ellipsis included, and no behaviour: when and how a
trail shortens is left to every project, and most never decide. A deep trail wraps onto two lines
or shrinks every crumb into an unreadable stub, the current page is drawn as a link to itself, and
a long repository name pushes everything else off the screen.

<Preview demo={basicDemo} />

## When to use

**Use it when**

- A page sits deep in a hierarchy and the reader needs the way back up: a team, a project, a
  repository, a file.
- Names in the trail can be long, like a repository or a branch, and the header has fixed room.

**Reach for something else when**

- The hierarchy is the navigation itself, opened and browsed level by level:
  [Tree view](/docs/kit/tree-view).
- The trail is two levels deep and never long: shadcn's `breadcrumb` parts, written out directly.
- The reader moves through steps in order rather than up a hierarchy:
  [Stepper](/docs/kit/stepper).

## Usage

```svelte
<script lang="ts">
	import Breadcrumbs from '#lib/components/coral/kit/breadcrumbs/breadcrumbs.svelte';
	import type { Crumb } from '#lib/components/coral/kit/breadcrumbs/types.js';

	const trail: Crumb[] = [
		{ label: 'Projects', href: '/projects' },
		{ label: 'api-gateway', href: '/projects/api-gateway' },
		{ label: 'Deployments' }
	];
</script>

<Breadcrumbs items={trail} />
```

Crumbs go root first; the last one is the current page and needs no `href`.

## Examples

### Folding

<Preview demo={foldedDemo} class="min-h-32" />

Resize the preview, or the window. The whole trail is measured off an invisible copy, so the shown
trail never has to change shape to find out whether it fits, and the fold runs from the second
crumb forward: what disappears first is the middle of the path, and what stays is the root, the
fold, and the pages nearest to where the reader is.

As many crumbs fold as it takes and no more; give the window back and they come back. A long name
on either end truncates, and keeps its full text in the title.

### Your own crumbs

<Preview demo={customDemo} />

The `item` snippet replaces what a crumb shows (an icon beside the root, a status dot) and the
link or the current-page mark stays around it. `separator` replaces the glyph between crumbs.

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

## Keyboard

Every crumb but the current page is a link, reached with `Tab` and followed with `Enter`. The fold
control is the shadcn dropdown menu's trigger:

| Key                     | Action                                                 |
| ----------------------- | ------------------------------------------------------ |
| `Enter` / `Space` / `↓` | On the fold control, opens the menu of folded pages.   |
| `↓` / `↑`               | In the menu, moves between the folded pages.           |
| `Enter`                 | In the menu, follows the focused page's link.          |
| `Escape`                | Closes the menu and returns focus to the fold control. |

## Accessibility

The `<nav>` is the primitive's, named `breadcrumb`, and the trail is an ordered list, so a screen
reader hears how deep it is. The current page carries `aria-current="page"`. The fold is a real
button with `foldedLabel` as its name, and it opens a menu of links the arrow keys walk, so no page
is reachable by mouse alone. The measuring copy is `aria-hidden` and invisible: it exists for the
measurement and for nothing else.

- **Both ends stay.** The root and the current page are never folded, because a trail that has lost
  where it starts or where it is has stopped being a trail.
- **Every page stays reachable.** The folded pages are links in the menu, in order, with their
  names in full.
- **The current page is the current page.** It is marked `aria-current="page"` and not linked,
  which is what the primitive's `Page` part is for.

## Customizing

- **Class props.** `class` merges onto the `<nav>`, `listClass` onto the list.
- **Snippets.** `item` replaces what a crumb shows and receives the crumb, its index and whether it
  is the current page; the link or the current-page mark stays around it. `separator` replaces the
  glyph inside the primitive's separator.
- **Project-wide defaults.** `foldedLabel` can be stated once under `'kit/breadcrumbs'` with
  `setCoralDefaults`: see [Project-wide defaults](/docs/conventions#project-wide-defaults).

`fit.ts` exports `foldCount`, the arithmetic that decides how many crumbs fold given their widths
and the room available, for a trail drawn some other way. Dropping to shadcn's `breadcrumb` parts
means rebuilding the measurement off a hidden copy, the fold menu, and the current page drawn as a
`Page` rather than a link.
