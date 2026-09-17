---
title: Reorder list
description: Drag to reorder with a mouse, a finger or the keyboard - and persist once per drop.
---

<script lang="ts">
	import Preview from '$lib/docs/preview.svelte';
</script>

HTML5 `draggable` gets a sortable list working on a desktop in an afternoon, and then it does not work
on a phone - touch devices do not fire its events - and there is no way to do it from the keyboard at
all. The bound array usually updates on every row the pointer crosses, so an `$effect` that saves the
order sends a request for each one.

<Preview name="kit/reorder-list/basic" />

## What Coral adds

- **Pointer events, not drag-and-drop.** Mouse, pen and touch alike, with the page kept from
  scrolling under the finger.
- **A keyboard path.** Focus a handle, Space to pick up, arrows (and Home, End) to move, Space to
  drop, Escape to put it back. Tabbing away drops it where it is.
- **Announced.** Picked up, each move, dropped and cancelled are spoken with the position - "moved to
  position 3 of 5" - and the handle describes how to use it. All wording is replaceable.
- **One write per drop.** Rows slide live while dragging, but `items` and `onreorder` only change on
  drop - and not at all for a drop back where it started.
- **Swaps where the eye expects.** A row gives way when the dragged row's centre passes its centre,
  whichever part of the handle was grabbed. Neighbours slide aside, unless reduced motion is on.

## Your own row

<Preview name="kit/reorder-list/custom-row" />

The `item` snippet replaces the row's body and keeps Coral's grip. The `row` snippet replaces
everything: spread `handle` onto whatever should grab the row - a grip, or the whole row.

Entries are keyed by `getKey`, which defaults to the entry itself. Pass it for objects that are
recreated between renders, and never return the index - the index is what changes.

## Installation

No shadcn primitives.

```svelte
<script lang="ts">
	import ReorderList from '$lib/coral/kit/reorder-list/reorder-list.svelte';
</script>
```

## Props

Everything a `<ul>` accepts stays available. On top of that:

| Prop                                       | Type                                       | Default     | Description                                      |
| ------------------------------------------ | ------------------------------------------ | ----------- | ------------------------------------------------ |
| `items`                                    | `T[]`                                      | -           | Bindable. Written once per drop.                 |
| `getKey`                                   | `(item: T) => unknown`                     | identity    | Identifies an entry across moves.                |
| `getLabel`                                 | `(item: T) => string`                      | `String`    | Names an entry for the handle and announcements. |
| `onreorder`                                | `(items: T[], { item, from, to }) => void` | -           | Once per drop that changed the order.            |
| `disabled`                                 | `boolean`                                  | `false`     | Blocks dragging.                                 |
| `handleLabel`                              | `(label: string) => string`                | `Reorder …` | Accessible name of each handle.                  |
| `instructions`                             | `string`                                   | English     | Describes the keyboard controls.                 |
| `grabbed`, `moved`, `dropped`, `cancelled` | `(label, position, total) => string`       | English     | Announcements.                                   |
| `itemClass`                                | `string`                                   | -           | Merged onto every row.                           |
| `item`                                     | `Snippet<[ItemContext<T>]>`                | -           | Row body, after the grip.                        |
| `row`                                      | `Snippet<[ItemContext<T>]>`                | -           | The whole row. Spread `handle`.                  |

`ItemContext` is `{ item, index, dragging, handle }`. Rows being dragged carry `data-dragging`.

## Scope

Vertical lists only, and no auto-scroll while dragging near the edge of a scrolling container - both
are real needs, and neither has come up in a list short enough for this component to be the right
tool. A board with columns is a block, not this.
