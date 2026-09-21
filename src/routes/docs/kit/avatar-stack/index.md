---
title: Avatar stack
description: Overlapping avatars with a count for the rest - and a list a screen reader can read.
---

<script lang="ts">
	import Preview from '$lib/docs/preview.svelte';
</script>

shadcn ships the overlap, `AvatarGroup` and `AvatarGroupCount`. What it leaves to each call site is
the arithmetic: slice the list, count the rest, render `+N`. That arithmetic is usually written
so that `max={4}` draws four avatars _and_ a count, a fifth circle, and six people in five slots
renders `+1`, a circle that hides exactly one avatar the same size as itself.

<Preview name="kit/avatar-stack/basic" />

## What Coral adds

- **`max` is the width.** It counts circles, the count included, so the space a layout reserves is
  the space the stack takes.
- **Never `+1`.** When one person would be hidden, they are drawn instead.
- **A list:** `role="list"`, so a screen reader announces how many people there are before reading
  them, and each avatar names its person through [kit/avatar](/docs/kit/avatar).
- **Hidden people are not anonymous.** The count is labelled ("3 more") and lists the hidden names
  on hover.
- **Any item shape:** `getPerson` maps your own type onto name and photo, so a list of users does
  not have to be reshaped first.

## Listing the rest

<Preview name="kit/avatar-stack/overflow" />

The `overflow` snippet receives the hidden items, the count and its label, enough to put the count in
a popover or a tooltip. Render an `AvatarGroupCount` so it keeps its place in the overlap.

## Installation

```bash
pnpm dlx shadcn-svelte@latest add avatar
```

Composes [`kit/avatar`](/docs/kit/avatar): copy both folders.

```svelte
<script lang="ts">
	import AvatarStack from '$lib/coral/kit/avatar-stack/avatar-stack.svelte';
</script>
```

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

## overflow.ts

```ts
import { split } from '$lib/coral/kit/avatar-stack/overflow.js';

split(['Amara', 'Wei', 'Sofia', 'Liam', 'Priya'], 4);
// { visible: ['Amara', 'Wei', 'Sofia'], hidden: ['Liam', 'Priya'] }
```
