---
title: Avatar stack
description: Overlapping avatars with a count for the rest - and a list a screen reader can read.
group: Kit
---

<script lang="ts">
	import Preview from '#lib/features/docs/components/Preview.svelte';
	import basicDemo from './demos/basic.svelte?demo';
	import overflowDemo from './demos/overflow.svelte?demo';
</script>

shadcn ships the overlap, `AvatarGroup` and `AvatarGroupCount`. What it leaves to each call site is
the arithmetic: slice the list, count the rest, render `+N`. That arithmetic is usually written
so that `max={4}` draws four avatars _and_ a count, a fifth circle, and six people in five slots
renders `+1`, a circle that hides exactly one avatar the same size as itself.

- **`max` is the width.** It counts circles, the count included, so the space a layout reserves is
  the space the stack takes.
- **Never `+1`.** When one person would be hidden, they are drawn instead.
- **A list:** `role="list"`, so a screen reader announces how many people there are before reading
  them, and each avatar names its person through [kit/avatar](/docs/kit/avatar).
- **Hidden people are not anonymous.** The count is labelled ("3 more") and lists the hidden names
  on hover.
- **Any item shape:** `getPerson` maps your own type onto name and photo, so a list of users does
  not have to be reshaped first.

<Preview demo={basicDemo} />

## When to use

**Use it when**

- A row has to show who is involved in little space: an issue's assignees, a project's members, who
  is viewing a deployment.
- The list can be longer than the space, and the rest should be counted rather than cut off.

**Reach for something else when**

- One person is shown: use [Avatar](/docs/kit/avatar).
- Every name has to be readable at a glance, like a team's member list: a list of avatars with
  names beside them, not a stack.

## Usage

Composes [`kit/avatar`](/docs/kit/avatar), which the install brings with it.

```svelte
<script lang="ts">
	import AvatarStack from '#lib/components/coral/kit/avatar-stack/avatar-stack.svelte';
</script>
```

```svelte
<AvatarStack
	label="Assignees"
	max={4}
	items={[
		{ name: 'Amara Diallo', src: '/team/amara.jpg' },
		{ name: 'Wei Zhang' },
		{ name: 'Sofia Rossi' },
		{ name: "Liam O'Connor" },
		{ name: 'Priya Sharma' }
	]}
/>
```

## Examples

### Listing the rest

<Preview demo={overflowDemo} />

The `overflow` snippet receives the hidden items, the count and its label, enough to put the count in
a popover or a tooltip. Render an `AvatarGroupCount` so it keeps its place in the overlap.

### Empty, and short lists

An empty `items` renders an empty list with no count. A list that fits in `max`, or any list when
`max` is omitted, draws everyone and no count. A `max` below 1 is read as 1.

## Props

Everything the shadcn avatar group accepts stays available: `class`, `aria-*`, `ref`. On top of
that:

| Prop            | Type                                  | Default        | Description                                           |
| --------------- | ------------------------------------- | -------------- | ----------------------------------------------------- |
| `items`         | `T[]`                                 | -              | Who to show, in order. Required.                      |
| `max`           | `number`                              | -              | Circles drawn, count included. Omit to draw everyone. |
| `getPerson`     | `(item: T) => { name, src, alt }`     | identity       | Maps an item to what the avatar reads.                |
| `getKey`        | `(item: T, index: number) => unknown` | index          | Keys each avatar.                                     |
| `size`          | `'sm' \| 'default' \| 'lg'`           | `default`      | Forwarded to every avatar; the count follows.         |
| `label`         | `string`                              | -              | Names the whole stack.                                |
| `overflowLabel` | `(count: number) => string`           | `{count} more` | Accessible label for the count.                       |
| `avatar`        | `Snippet<[{ item, index }]>`          | -              | Replaces each avatar.                                 |
| `overflow`      | `Snippet<[{ hidden, count, label }]>` | -              | Replaces the count.                                   |

## Keyboard

Nothing to press: the stack is a list of images and takes no focus. A count that should open the
full list belongs in the `overflow` snippet, wrapped in a button or a popover trigger that carries
the keyboard.

## Accessibility

- **A list.** The group is `role="list"` and each avatar and the count is a `listitem`, so a screen
  reader announces how many there are. The roles sit on the avatars themselves, because a wrapper
  would break the overlap the group draws on its direct children.
- **Named.** `label` becomes the list's `aria-label`; each avatar is named by its person, as
  [kit/avatar](/docs/kit/avatar) describes.
- **The count.** It is labelled with `overflowLabel` ("3 more") and its `+3` is hidden from screen
  readers. Its `title` lists the hidden names that have one, for a reader hovering it.

## Customizing

- **`class`** and every other prop of the shadcn `AvatarGroup` land on the group.
- **`avatar`** replaces each avatar. Render an avatar whose root is the direct child, so the overlap
  still applies.
- **`overflow`** replaces the count, and receives `label` to put on whatever replaces it.
- **Project-wide defaults.** `overflowLabel` can be stated once with
  [`setCoralDefaults`](/docs/conventions#project-wide-defaults) under `'kit/avatar-stack'`, for a
  project written in another language; a prop at the call site still wins.

### overflow.ts

The arithmetic is exported on its own, for a stack drawn with shadcn's `AvatarGroup` directly:

```ts
import { split } from '#lib/components/coral/kit/avatar-stack/overflow.js';

split(['Amara', 'Wei', 'Sofia', 'Liam', 'Priya'], 4);
// { visible: ['Amara', 'Wei', 'Sofia'], hidden: ['Liam', 'Priya'] }
```

That rebuild keeps the never-`+1` rule and leaves you to write the list roles, the count's label
and the hidden names back by hand.
