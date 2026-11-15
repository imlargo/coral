---
title: Reorder list
description: Drag to reorder with a mouse, a finger or the keyboard - and persist once per drop.
group: Kit
---

<script lang="ts">
	import Preview from '#lib/features/docs/components/Preview.svelte';
	import basicDemo from './demos/basic.svelte?demo';
	import customRowDemo from './demos/custom-row.svelte?demo';
</script>

HTML5 `draggable` gets a sortable list working on a desktop in an afternoon, and then it does not work
on a phone (touch devices do not fire its events), and there is no way to do it from the keyboard at
all. The bound array usually updates on every row the pointer crosses, so an `$effect` that saves the
order sends a request for each one.

<Preview demo={basicDemo} />

## When to use

**Use it when**

- The reader sets an order that matters and is saved: pipeline stages, environment promotion order,
  a project's pinned repositories.
- The list is short and vertical, and has to work with a mouse, a finger and the keyboard.
- Saving the order is a request, and it should go out once per drop.

**Reach for something else when**

- The order is a sort the reader picks (by name, by date): a sort control on a shadcn `Table`.
- Items move between columns, like a board: that is a block, not this. See [Scope](#scope).
- The list is long enough to scroll while dragging: there is no auto-scroll near the edge of a
  scrolling container.

## Usage

```svelte
<script lang="ts">
	import ReorderList from '#lib/components/coral/kit/reorder-list/reorder-list.svelte';

	let stages = $state(['Install', 'Lint', 'Test', 'Build', 'Deploy']);
</script>

<ReorderList
	bind:items={stages}
	aria-label="Pipeline stages"
	onreorder={(items) => console.log('Save order', items)}
/>
```

## Examples

### One write per drop

Rows slide live while dragging, but `items` and `onreorder` only change on drop, and not at all for
a drop back where it started. A row gives way when the dragged row's centre passes its centre,
whichever part of the handle was grabbed. Dragging uses pointer events, not HTML5 drag-and-drop, so
mouse, pen and touch behave alike, with the page kept from scrolling under the finger.

### Your own row

<Preview demo={customRowDemo} />

The `item` snippet replaces the row's body and keeps Coral's grip. The `row` snippet replaces
everything: spread `handle` onto whatever should grab the row, whether that's a grip or the whole
row.

Entries are keyed by `getKey`, which defaults to the entry itself. Pass it for objects that are
recreated between renders, and never return the index, since the index is what changes.

### Disabled

With `disabled`, every handle leaves the tab order and is marked `aria-disabled`, and neither a
pointer nor a key starts a drag.

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

## Keyboard

Each row's handle is a tab stop. With focus on a handle:

| Key               | Action                                                         |
| ----------------- | -------------------------------------------------------------- |
| `Space` / `Enter` | Picks the row up; pressed again, drops it where it is.         |
| `↑` / `↓`         | While picked up, moves the row one position.                   |
| `Home` / `End`    | While picked up, moves the row to the first or last position.  |
| `Escape`          | While picked up, puts the row back where it started.           |
| `Tab`             | While picked up, drops the row where it is and moves focus on. |

Focus stays on the moved row's handle as it moves. A click elsewhere that takes focus away also
drops the row where it is, rather than leaving a move half done.

## Accessibility

- **A named handle.** Each handle is a `role="button"` named by `handleLabel` ("Reorder Lint"),
  described by `instructions`, and `aria-pressed` while its row is picked up from the keyboard.
- **Announced.** Picked up, each move, dropped and cancelled are spoken with the position ("moved
  to position 3 of 5") through an assertive live region, since a row moving under the reader's
  hands is happening now. All wording is replaceable.
- **A list with a count.** The `<ul>` restates `role="list"`, which Safari drops from a list with
  its bullets removed, so "list, 5 items" is heard before reordering.
- **Reduced motion.** Neighbours slide aside with a short animation, which is turned off under
  `prefers-reduced-motion`.

## Customizing

- **Class props.** `class` merges onto the `<ul>`, `itemClass` onto every row. The list carries
  `data-dragging` with the mode (`pointer` or `keyboard`) during a drag, and the dragged row
  carries `data-dragging` too.
- **Snippets.** `item` replaces the row's body and keeps Coral's grip. `row` replaces everything:
  spread `handle` onto whatever should grab the row.
- **Project-wide defaults.** `handleLabel`, `instructions`, `grabbed`, `moved`, `dropped` and
  `cancelled` can be stated once under `'kit/reorder-list'` with `setCoralDefaults`: see
  [Project-wide defaults](/docs/conventions#project-wide-defaults).

`reorder.ts` exports the arithmetic on its own: `move` returns a list with one entry moved,
`targetIndex` picks where a dragged centre lands among the rows' midpoints, and `keyTarget` maps a
key to a position. Dropping to a hand-written list means rebuilding pointer capture, the keyboard
path, the announcements and the single write per drop.

## Scope

Vertical lists only, and no auto-scroll while dragging near the edge of a scrolling container. Both
are real needs, and neither has come up in a list short enough for this component to be the right
tool. A board with columns is a block, not this.
