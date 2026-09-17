---
title: Tree view
description: A hierarchy the keyboard can walk - the WAI-ARIA tree pattern, from a plain array.
---

<script lang="ts">
	import Preview from '$lib/docs/preview.svelte';
</script>

Nested `<ul>`s with a chevron that toggles a boolean is a tree for the mouse. The keyboard gets
nothing - or a tab stop per row, which in a folder of two hundred files is two hundred Tab presses to
get past it - and a screen reader hears a list of lists with no idea what is open.

<Preview name="kit/tree-view/basic" />

## What Coral adds

- **One tab stop.** The tree is reached with Tab once; inside it, the arrows move.
- **The whole keyboard pattern.** Up and Down move; Right opens a node, then steps into it; Left closes
  it, then steps out to the parent; Home and End; Enter and Space select; `*` opens every sibling;
  typing letters jumps to the next matching row, ignoring case and accents.
- **Announced structure.** `aria-level`, `aria-posinset`, `aria-setsize` and `aria-expanded` on every
  row: "Contratos, expanded, level 1, 1 of 3".
- **Focus never lost.** Collapsing a folder that contains the focused row moves focus to the folder.
- **Disabled nodes stay reachable.** They cannot be selected, but can still be read and expanded.
- **Right-to-left aware.** Left and Right swap, and the chevron flips.

## Loading children on demand

<Preview name="kit/tree-view/lazy" />

A node with `children: []` is a branch with nothing loaded yet - it can be opened. Fetch when its id
appears in `onexpandedchange`, then hand back `nodes` with the children filled in.

## Data

```ts
type TreeNode<T = unknown> = {
	id: string; // unique across the whole tree
	label: string; // shown, and matched by typeahead
	children?: TreeNode<T>[]; // omit for a leaf; [] for an empty branch
	disabled?: boolean;
	data?: T; // yours, handed back in onselect and the snippet
};
```

## Installation

No shadcn primitives.

```svelte
<script lang="ts">
	import TreeView from '$lib/coral/kit/tree-view/tree-view.svelte';
</script>
```

## Props

Everything a `<div>` accepts stays available on the root. On top of that:

| Prop               | Type                           | Default | Description                                        |
| ------------------ | ------------------------------ | ------- | -------------------------------------------------- |
| `nodes`            | `TreeNode<T>[]`                | -       | The top level. Required.                           |
| `expanded`         | `string[]`                     | `[]`    | Bindable. Ids of the open nodes.                   |
| `selected`         | `string`                       | -       | Bindable. Id of the selected node.                 |
| `onselect`         | `(node: TreeNode<T>) => void`  | -       | Click, Enter or Space. Never for disabled nodes.   |
| `onexpandedchange` | `(expanded: string[]) => void` | -       | Nodes opened or closed.                            |
| `label`            | `string`                       | -       | Names the tree. Or use `aria-labelledby`.          |
| `locale`           | `string`                       | -       | Typeahead's case- and accent-insensitive matching. |
| `toggleLabel`      | `(node, expanded) => string`   | -       | Tooltip on the chevron.                            |
| `class`            | `string`                       | -       | Merged onto the root. `[--coral-indent:1.5rem]`.   |
| `rowClass`         | `string`                       | -       | Merged onto every row.                             |
| `node`             | `Snippet<[NodeContext<T>]>`    | -       | Replaces the row body.                             |
| `icon`             | `Snippet<[NodeContext<T>]>`    | -       | Replaces the chevron.                              |

Rows expose `data-state="open|closed"`, `data-selected` and `data-disabled` for styling.

## Accessibility

Rows are rendered flat, each carrying its level, position and set size, rather than as nested
`role="group"`s. Assistive tech announces the same structure from those attributes, and a flat list
lets the focus ring sit on one row instead of ringing everything below it. The chevron is a mouse
target hidden from assistive tech: a second focusable control inside a tree item would break the
one-tab-stop model the pattern depends on.
