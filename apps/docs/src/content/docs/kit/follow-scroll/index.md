---
title: Follow scroll
description: A scroller that stays at the end while new content arrives - and stops the moment the reader scrolls away.
group: Kit
---

<script lang="ts">
	import Preview from '#lib/features/docs/components/Preview.svelte';
	import basicDemo from './demos/basic.svelte?demo';
	import chatDemo from './demos/chat.svelte?demo';
</script>

Logs, build output, chat threads: anything that grows from the bottom needs the same rule, and
`scrollTop = scrollHeight` on every update is not it. That version yanks the view back down while
someone is reading further up, which is the single most complained-about behaviour in a log viewer.
The fix people reach for - a "follow" checkbox - moves the decision onto the reader for something
they already expressed by scrolling.

<Preview demo={basicDemo} class="min-h-96" />

## When to use

**Use it when**

- Content grows at the bottom while the reader watches: build logs, deployment output, a chat
  thread, a streamed response.
- The reader may scroll up to read something older and must not be pulled back down.

**Reach for something else when**

- Older content is loaded above what the reader sees, like earlier messages: that wants scroll
  anchoring, which this does not do. See
  [What is deliberately not here](#what-is-deliberately-not-here).
- The list is long enough to need virtualization: a virtual list, which this does not replace.
- The content does not grow while it is open: shadcn's `ScrollArea`, or a plain scrolling `<div>`.

## Usage

```svelte
<script lang="ts">
	import FollowScroll from '#lib/components/coral/kit/follow-scroll/follow-scroll.svelte';

	let lines = $state(['Queued', 'Starting runner', 'Installing dependencies']);
</script>

<FollowScroll count={lines.length} class="h-64" aria-label="Build output">
	{#each lines as line, index (index)}
		<p>{line}</p>
	{/each}
</FollowScroll>
```

## Examples

### Following a stream

It follows only while the reader is at the end. Scroll back and it lets go; scroll down again and it
picks up where it left off. Nothing to tick.

"At the end" has a tolerance, `threshold`. Fractional scroll heights on a zoomed page never land on
an exact equality, a smooth scroll stops a pixel short, and a single nudge of the wheel is not a
decision to stop following.

### Behind the end

While the reader is behind and something has arrived, a control offers the way back, with a count
of what arrived when there is something countable to count. Pressing it scrolls to the end and
follows again.

### With a composer

<Preview demo={chatDemo} class="min-h-96" />

`pinned` is bindable and reads as an instruction, not just a flag: set it to `true` after sending a
message and the view returns to the end. Start it at `false` for a view that opens at the top.

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

## Keyboard

The scroller is a real scrolling element, so the keyboard reaches it and `Page Down`, `Page Up`,
`Home`, `End` and the arrows scroll it as they always do. Scrolling to the end with the keyboard
resumes following, exactly as the wheel does. The way back is a native button, pressed with `Enter`
or `Space`.

## Accessibility

The scroller is a real scrolling element, reached by the keyboard like any other. Give it an
`aria-label`, as the demos do, because a scrollable region that takes focus should say what it
holds.

- **The count is part of the name.** The way back reads "3 new · Jump to latest" as one button,
  rather than a badge that would need a label of its own.
- **Reduced motion is respected.** Following is instant either way; the jump back is smooth unless
  the reader asked for less movement.

New content is not announced. A log that reads itself out loud over whatever the reader is doing is
unusable; where an arrival is worth announcing, announce the one that matters with
`lib/live-region` rather than the stream.

## Customizing

- **Where things land.** `class` merges onto the outer element, which positions the way back and
  needs a height; every other attribute, `aria-label` included, lands on the inner scroller, which
  `ref` binds.
- **The way back.** The `jump` snippet replaces it and receives `unread`, `behind` and
  `scrollToEnd()`, which goes to the end and resumes following.
- **Project-wide defaults.** `threshold`, `jumpLabel` and `unreadLabel` can be stated once under
  `'kit/follow-scroll'` with `setCoralDefaults`: see
  [Project-wide defaults](/docs/conventions#project-wide-defaults).

Growth is watched, not guessed: a `ResizeObserver` on the content catches text streaming into an
existing line as well as new lines arriving. Dropping to a plain scroller means rebuilding that
observer, the tolerance at the end, the unread count since the reader looked away, and the way back.

### follow.ts

The rules are plain functions over a viewport, so the same decision can drive something else:

```ts
import { isAtEnd, unreadSince } from '#lib/components/coral/kit/follow-scroll/follow.js';

isAtEnd({ scrollTop: 590, clientHeight: 400, scrollHeight: 1000 }); // true - within the tolerance
unreadSince(12, 5); // 7
```

## What is deliberately not here

Keeping the position when content is added _above_ - loading older messages - which is the opposite
problem and wants anchoring rather than following. And virtualization: this renders what it is
given, and a list long enough to need windowing needs it whether or not it follows.
