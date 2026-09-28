---
title: Follow scroll
description: A scroller that stays at the end while new content arrives - and stops the moment the reader scrolls away.
---

<script lang="ts">
	import Preview from '$docs/preview.svelte';
</script>

Logs, build output, chat threads: anything that grows from the bottom needs the same rule, and
`scrollTop = scrollHeight` on every update is not it. That version yanks the view back down while
someone is reading further up, which is the single most complained-about behaviour in a log viewer.
The fix people reach for - a "follow" checkbox - moves the decision onto the reader for something
they already expressed by scrolling.

<Preview name="kit/follow-scroll/basic" class="min-h-96" />

## What Coral adds

- **It follows only while the reader is at the end.** Scroll back and it lets go; scroll down again
  and it picks up where it left off. Nothing to tick.
- **"At the end" has a tolerance.** Fractional scroll heights on a zoomed page never land on an
  exact equality, a smooth scroll stops a pixel short, and a single nudge of the wheel is not a
  decision to stop following.
- **It says what you missed.** While the reader is behind, a control offers the way back - with a
  count of what arrived, when there is something countable to count.
- **Growth is watched, not guessed.** A `ResizeObserver` on the content catches text streaming into
  an existing line as well as new lines arriving.
- **Reduced motion is respected.** Following is instant either way; the jump back is smooth unless
  the reader asked for less movement.

## With a composer

<Preview name="kit/follow-scroll/chat" class="min-h-96" />

`pinned` is bindable and reads as an instruction, not just a flag: set it to `true` after sending a
message and the view returns to the end. Start it at `false` for a view that opens at the top.

## Import

```svelte
<script lang="ts">
	import FollowScroll from '$lib/components/coral/kit/follow-scroll/follow-scroll.svelte';
</script>
```

## Props

Everything a `<div>` accepts stays available on the scroller. On top of that:

| Prop             | Type                                         | Default          | Description                                                 |
| ---------------- | -------------------------------------------- | ---------------- | ----------------------------------------------------------- |
| `pinned`         | `boolean`                                    | `true`           | Bindable. Whether it is following the end.                  |
| `onpinnedchange` | `(pinned: boolean) => void`                  | -                | The reader pinned or unpinned it.                           |
| `count`          | `number`                                     | -                | How many entries there are, so what arrived can be counted. |
| `threshold`      | `number`                                     | `32`             | How close to the end still counts as the end, in pixels.    |
| `jumpLabel`      | `string`                                     | `Jump to latest` | Label for the way back.                                     |
| `unreadLabel`    | `(unread: number) => string`                 | `3 new`          | Reads the count on it.                                      |
| `class`          | `string`                                     | -                | Merged onto the outer element. Give it a height.            |
| `children`       | `Snippet`                                    | -                | The content. Required.                                      |
| `jump`           | `Snippet<[{ unread, behind, scrollToEnd }]>` | -                | Replaces the way back.                                      |

`count` is optional on purpose: the view follows content by height, so a stream of tokens with no
countable entries works exactly the same - it just says "jump to latest" without a number.

## Accessibility

The scroller is a real scrolling element, so the keyboard reaches it and Page Down, Home and End do
what they always do. Give it an `aria-label`, as the demos do, because a scrollable region that
takes focus should say what it holds.

New content is not announced. A log that reads itself out loud over whatever the reader is doing is
unusable; where an arrival is worth announcing, announce the one that matters with
`lib/live-region` rather than the stream.

## What is deliberately not here

Keeping the position when content is added _above_ - loading older messages - which is the opposite
problem and wants anchoring rather than following. And virtualization: this renders what it is
given, and a list long enough to need windowing needs it whether or not it follows.

## follow.ts

The rules are plain functions over a viewport, so the same decision can drive something else:

```ts
import { isAtEnd, unreadSince } from '$lib/components/coral/kit/follow-scroll/follow.js';

isAtEnd({ scrollTop: 590, clientHeight: 400, scrollHeight: 1000 }); // true - within the tolerance
unreadSince(12, 5); // 7
```
