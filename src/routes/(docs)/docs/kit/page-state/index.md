---
title: Page state
description: The states a screen goes through - waiting, failed, empty, content - and a wait that does not flash.
---

<script lang="ts">
	import Preview from '#docs/preview.svelte';
</script>

Every screen that fetches something has four states and usually ships with two. The version that
gets written is `{#if loading}` / `{:else if error}` / `{:else}`, and it has the same three problems
everywhere: a request that answers in 80ms flashes a spinner nobody can read, a refresh blanks the
rows the reader was looking at, and a failed reload flickers back to a spinner so the error is never
read at all.

<Preview name="kit/page-state/basic" class="min-h-96" />

## What Coral adds

- **A wait has to earn its indicator.** Nothing is drawn for the first `delay`, so fast requests
  show nothing at all.
- **What is drawn stays.** Once an indicator is up it holds for `minimum`, because something that
  appears and vanishes inside two frames is a blink the eye catches and cannot resolve - worse than
  either showing it properly or not at all.
- **A refresh keeps its content.** While a wait is still inside the delay window, whatever is on
  screen stays there instead of being replaced by a spinner.
- **One order for the states, decided once.** An error outranks a reload, so a failed refresh keeps
  saying what went wrong; an empty result is never announced while something is still loading.
- **Retrying is a real request.** The retry goes through
  [action button](/docs/kit/action-button): one press, one attempt, and a failure that stays put.
  A custom `errorState` gets the same guard through the `retrying`/`retry` it is handed, rather than
  keeping a second one of its own.

## The three windows

```
request starts ─── delay (200ms) ───▶ indicator appears ─── minimum (400ms) ───▶ may go
```

A request that finishes before the first mark draws nothing. One that passes it draws the loading
state and keeps it to the second mark, even if the data arrives immediately after. Both are props,
so a screen that knows its own latency can tune them.

## A placeholder shaped like the content

<Preview name="kit/page-state/skeleton" class="min-h-96" />

A spinner says "wait"; a skeleton says "wait, and here is what for". The `loadingState` snippet is
where the second one goes - here it is the [data table](/docs/kit/data-table)'s own skeleton rows,
so the header and the column widths are already right when the rows land and nothing jumps.

## Import

```svelte
<script lang="ts">
	import PageState from '#lib/components/coral/kit/page-state/page-state.svelte';
</script>
```

## Props

Everything a `<div>` accepts stays available on the root. On top of that:

| Prop               | Type                                    | Default                 | Description                                                                          |
| ------------------ | --------------------------------------- | ----------------------- | ------------------------------------------------------------------------------------ |
| `loading`          | `boolean`                               | `false`                 | Something is being fetched.                                                          |
| `error`            | `unknown`                               | -                       | Anything truthy counts, so pass the error itself.                                    |
| `empty`            | `boolean`                               | `false`                 | There is nothing to show.                                                            |
| `onretry`          | `() => unknown`                         | -                       | Async-aware. Without it, no retry button.                                            |
| `onretryerror`     | `(error: unknown) => void`              | -                       | What `onretry` threw. Named for what failed, because `error` is the failure on show. |
| `delay`            | `number`                                | `200`                   | Milliseconds before anything is drawn for a wait.                                    |
| `minimum`          | `number`                                | `400`                   | Milliseconds an indicator stays once drawn.                                          |
| `emptyTitle`       | `string`                                | `Nothing here yet.`     | Heading for the empty state.                                                         |
| `emptyDescription` | `string`                                | -                       | Line under it.                                                                       |
| `errorTitle`       | `string`                                | `Something went wrong.` | Heading for the error state.                                                         |
| `errorDescription` | `string`                                | -                       | Line under it.                                                                       |
| `retryLabel`       | `string`                                | `Try again`             | Label for the retry button.                                                          |
| `status`           | `PageStateKind`                         | `'idle'`                | Bindable. Which state is showing.                                                    |
| `children`         | `Snippet`                               | -                       | The content. Required.                                                               |
| `loadingState`     | `Snippet`                               | -                       | Replaces the loading state.                                                          |
| `emptyState`       | `Snippet`                               | -                       | Replaces the empty state.                                                            |
| `errorState`       | `Snippet<[{ error, retry, retrying }]>` | -                       | Replaces the error state.                                                            |

`status` is one of `idle`, `loading`, `error`, `empty` or `content`, and is also on the root as
`data-state`. `idle` is the honest name for "waiting, but not long enough to say so yet".

## Accessibility

The region carries `aria-busy` from the moment a request starts, not from the moment an indicator
appears - assistive tech is told the truth even during the delay window, where the screen
deliberately looks unchanged.

What is **not** here is an announcement per state change. A screen that swaps its contents under a
reader mid-sentence is worse than one that waits, and what is worth saying depends on what the
screen is for. Where it matters, announce it yourself with `lib/live-region`, or move focus to the
error heading.

## delay.ts

The rules are plain functions, so the same timing can drive something that is not a screen - a
button's own spinner, an inline field:

```ts
import { shownFrom, stateOf, waitUntil } from '#lib/components/coral/kit/page-state/delay.js';

shownFrom(started, { delay: 200, minimum: 400 }); // when an indicator may appear
waitUntil(moment, Date.now()); // never negative
stateOf({ loading: true, error: null, empty: false, showLoading: false }); // 'idle'
```
