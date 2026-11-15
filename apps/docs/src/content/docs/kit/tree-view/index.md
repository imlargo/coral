---
title: Tree view
description: A hierarchy the keyboard can walk - the WAI-ARIA tree pattern, from a plain array.
group: Kit
category: Data display
---

<script lang="ts">
	import Preview from '#lib/features/docs/components/Preview.svelte';
	import basicDemo from './demos/basic.svelte?demo';
	import actionsDemo from './demos/actions.svelte?demo';
	import lazyDemo from './demos/lazy.svelte?demo';
</script>

Nested `<ul>`s with a chevron that toggles a boolean is a tree for the mouse. The keyboard gets
nothing, or a tab stop per row, which in a folder of two hundred files is two hundred Tab presses to
get past it. A screen reader hears a list of lists with no idea what is open.

<Preview demo={basicDemo} />

## When to use

**Use it when**

- The data is a hierarchy the reader opens and closes: a repository's files, a project's
  environments and services, nested docs navigation.
- The tree is long enough that a tab stop per row would trap the keyboard.
- Branches are loaded on demand, or rows need actions such as rename and delete.

**Reach for something else when**

- The hierarchy is two levels at most and every section is read in turn: a shadcn `Accordion` or
  `Collapsible`.
- The reader picks one value in a form, and the hierarchy is only how the options happen to be
  stored: flatten them into [Select](/docs/kit/select) or [Combobox](/docs/kit/combobox).
- The path to the current page is all that matters: [Breadcrumbs](/docs/kit/breadcrumbs).

## Usage

```svelte
<script lang="ts">
	import TreeView from '#lib/components/coral/kit/tree-view/tree-view.svelte';
	import type { TreeNode } from '#lib/components/coral/kit/tree-view/types.js';

	const nodes: TreeNode[] = [
		{
			id: 'src',
			label: 'src',
			children: [
				{ id: 'src/routes', label: 'routes', children: [] },
				{ id: 'src/app.ts', label: 'app.ts' }
			]
		},
		{ id: 'package.json', label: 'package.json' }
	];

	let selected = $state<string>();
</script>

<TreeView {nodes} bind:selected label="Repository files" />
```

## Examples

### Row actions

<Preview demo={actionsDemo} />

File trees and navigation trees usually need rename, add or delete on a row, and a button inside a
`treeitem` is what breaks the tree's single tab stop. The `actions` snippet keeps the model whole:
its controls are taken out of the tab order, and Tab from a focused row steps into the first of them,
Tab again to the next, and past the last one out of the tree. Shift+Tab walks back, and Escape
returns to the row. A click on an action is the action's, not a selection.

Reveal them on hover and focus with `rowClass="group"` and `group-hover:` or `group-focus-within:`
on the controls, as the demo does. Keep them reachable: an action that only appears on hover still
exists for the keyboard, because Tab reaches it whether or not it is drawn.

### Indentation

Each level is indented by `--coral-indent`, set on the root through `class`. The indent is its own
element inside the row rather than padding on it, so a `rowClass` with `px-2` pads the row without
erasing the levels.

### Loading children on demand

<Preview demo={lazyDemo} />

A node with `children: []` is a branch with nothing loaded yet: it can be opened. Fetch when its id
appears in `onexpandedchange`, then hand back `nodes` with the children filled in.

### Disabled nodes

A node with `disabled: true` stays reachable from the keyboard and can still be opened and closed,
but `Enter`, `Space` and a click do not select it, and `onselect` is never called for it.

### Data

```ts
type TreeNode<T = unknown> = {
	id: string; // unique across the whole tree
	label: string; // shown, and matched by typeahead
	children?: TreeNode<T>[]; // omit for a leaf; [] for an empty branch
	disabled?: boolean;
	data?: T; // yours, handed back in onselect and the snippet
};
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
| `rowClass`         | `string`                       | -       | Merged onto every row. Padding is safe.            |
| `node`             | `Snippet<[NodeContext<T>]>`    | -       | Replaces the row body.                             |
| `icon`             | `Snippet<[NodeContext<T>]>`    | -       | Replaces the chevron.                              |
| `actions`          | `Snippet<[NodeContext<T>]>`    | -       | Controls at the end of each row.                   |

Rows expose `data-state="open|closed"`, `data-selected` and `data-disabled` for styling.

## Keyboard

The tree is one tab stop: `Tab` lands on the focused row, the selected one if the focused row is
gone, or the first. Inside it:

| Key               | Action                                                                |
| ----------------- | --------------------------------------------------------------------- |
| `↓` / `↑`         | Moves to the next or previous visible row.                            |
| `→`               | On a closed node, opens it. On an open one, moves to its first child. |
| `←`               | On an open node, closes it. Otherwise, moves to the parent.           |
| `Home` / `End`    | Moves to the first or last visible row.                               |
| `Enter` / `Space` | Selects the row, unless it is disabled.                               |
| `*`               | Opens every expandable sibling of the row.                            |
| Letters           | Jumps to the next row whose label starts with them, ignoring case.    |
| `Tab`             | With row actions: steps into the row's first action, then the next.   |
| `Shift` + `Tab`   | Inside the actions: steps back to the previous action, then the row.  |
| `Escape`          | Inside the actions: returns focus to the row.                         |

In a right-to-left tree, `←` and `→` swap and the chevron flips. Letters typed in quick
succession build one query; half a second's pause starts a new one, and typeahead ignores accents
as well as case. Keys pressed with `Alt`, `Ctrl` or `Meta` are left to the browser.

## Accessibility

Rows are rendered flat, each carrying its level, position and set size, rather than as nested
`role="group"`s. Assistive tech announces the same structure from those attributes, and a flat list
lets the focus ring sit on one row instead of ringing everything below it. The chevron is a mouse
target hidden from assistive tech: a second focusable control inside a tree item would break the
one-tab-stop model the pattern depends on.

Row actions are the one exception, and they are made to fit: their controls carry `tabindex="-1"`,
so sequential focus never visits them, and the row hands focus to them on Tab and takes it back on
Shift+Tab and Escape. A screen reader still finds them as buttons inside the row.

- **One tab stop.** The tree is reached with Tab once; inside it, the arrows move.
- **Announced structure.** `aria-level`, `aria-posinset`, `aria-setsize` and `aria-expanded` on
  every row, and `aria-selected` and `aria-disabled` where they apply: "src, expanded, level 1, 1
  of 3".
- **Focus never lost.** Collapsing a folder that contains the focused row moves focus to the folder.
- **Disabled nodes stay reachable.** They cannot be selected, but can still be read and expanded.
- **Named.** `label` sets the tree's `aria-label`; pass `aria-labelledby` instead to point at a
  visible heading.

## Customizing

- **Class props.** `class` merges onto the `role="tree"` root, where `--coral-indent` is set;
  `rowClass` merges onto every row. Rows carry `data-state`, `data-selected` and `data-disabled`
  for styling each state.
- **Snippets.** `node` replaces the row body, `icon` the chevron (on expandable rows only), and
  `actions` adds controls at the end of each row. Each receives the row's context: its node, level,
  position, whether it is expanded and selected, and a `toggle()` that opens or closes it.
- **Project-wide defaults.** `toggleLabel` can be stated once under `'kit/tree-view'` with
  `setCoralDefaults`, and `locale` through the shared one: see
  [Project-wide defaults](/docs/conventions#project-wide-defaults).

`tree.ts` exports the pieces the component is built from: `visibleRows` flattens the open nodes
into rows, `ancestorsOf`, `expandableSiblings` and `typeahead` answer the questions the keyboard
asks. Dropping to nested shadcn `Collapsible`s means rebuilding the single tab stop, every arrow
key, typeahead, the `aria-level` and position attributes, and the focus rescue on collapse.
