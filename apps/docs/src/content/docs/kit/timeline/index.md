---
title: Timeline
description: Events grouped by the reader's own calendar days, read as a list with a time on every one, and grown with older ones without moving what was read.
group: Kit
---

<script lang="ts">
	import Preview from '#lib/features/docs/components/Preview.svelte';
</script>

Audit logs, deployment histories, account activity: a product has several of these, and each one is
built again from styled `<div>`s. The day grouping is written by comparing date strings, which cuts a
day at UTC midnight rather than the reader's, so an evening deploy files under tomorrow. The list is
not a list, so a screen reader hears one run of text with no count and no time on anything. "Load
older" appends without a word, so nobody is told anything arrived.

<Preview name="kit/timeline/basic" />

## What Coral adds

- **Days cut where the reader is.** Events are grouped by the calendar day they fell on in the
  reader's own zone, through `Intl`, or in one zone for everybody when the product has one.
- **"Today" and "Yesterday" in the reader's language**, from `Intl`, then the formatted date.
- **A list a screen reader can read.** A heading per day at the level you choose, an ordered list
  under it, and a `<time datetime>` on every event.
- **Older events arrive below, and are announced.** The control keeps focus while it waits, nothing
  above it moves, and how many arrived is said out loud.
- **What an event says is yours.** The `item` snippet is required: Coral does not know what a
  deploy or a comment looks like, only when it happened.

## Loading older events

<Preview name="kit/timeline/older" />

`hasMore` shows the control; `onloadmore` fetches and appends to `items`, and follows the
[action convention](/docs/conventions): return a promise and it waits, return `false` or throw and
nothing changes. Once the list has grown, `loadedMessage` is announced with how many events came.

## One day for everybody

`timeZone` is left out for a personal history, where the reader's own day is the right one. An audit
log that every administrator must read the same way sets it, and every day line is cut there.

## Import

```svelte
<script lang="ts">
	import Timeline from '#lib/components/coral/kit/timeline/timeline.svelte';
</script>
```

## Props

Everything a `<div>` accepts stays available on the root. On top of that:

| Prop            | Type                                    | Default                  | Description                                    |
| --------------- | --------------------------------------- | ------------------------ | ---------------------------------------------- |
| `items`         | `T[]`                                   | -                        | The events, in reading order. Required.        |
| `getDate`       | `(item: T) => Date \| string \| number` | -                        | When an event happened. Required.              |
| `getKey`        | `(item: T, index: number) => unknown`   | position                 | Keys each event.                               |
| `locale`        | `string`                                | `en-US`                  | Headings and times.                            |
| `timeZone`      | `string`                                | the reader's             | Where the days are cut.                        |
| `dayFormat`     | `Intl.DateTimeFormatOptions`            | `{ dateStyle: 'long' }`  | A day heading past yesterday.                  |
| `timeFormat`    | `Intl.DateTimeFormatOptions`            | `{ timeStyle: 'short' }` | Each event's time.                             |
| `headingLevel`  | `2` to `6`                              | `3`                      | The heading level of each day.                 |
| `now`           | `Date`                                  | -                        | Pins the clock - tests, previews, snapshots.   |
| `hasMore`       | `boolean`                               | `false`                  | Shows the control that loads older events.     |
| `onloadmore`    | `() => unknown`                         | -                        | Loads older events. `false` or throw: nothing. |
| `onerror`       | `(error: unknown) => void`              | -                        | What `onloadmore` threw.                       |
| `loadMoreLabel` | `string`                                | `Show older`             | Label of that control.                         |
| `loadedMessage` | `(count: number) => string`             | `{count} older loaded`   | Announced once they arrived.                   |
| `emptyMessage`  | `string`                                | `Nothing here yet.`      | Shown with no events and none to load.         |
| `class`         | `string`                                | -                        | Merged onto the root.                          |
| `headingClass`  | `string`                                | -                        | Merged onto each day's heading.                |
| `listClass`     | `string`                                | -                        | Merged onto each day's list.                   |
| `itemClass`     | `string`                                | -                        | Merged onto every event row.                   |

### Snippets

| Snippet   | Receives                 | Replaces                                      |
| --------- | ------------------------ | --------------------------------------------- |
| `item`    | `{ item, date, index }`  | Nothing - it is what an event says. Required. |
| `heading` | `{ day, label, offset }` | The text of a day heading.                    |
| `empty`   | -                        | The empty state.                              |

## Accessibility

Each day is a heading at `headingLevel`, so the H key walks the days, and its events are an ordered
list, so the count is read before them. Every event carries a `<time datetime>` with the exact
instant, printed as the reader's clock beside it. Older events are loaded by a real button that keeps
focus while it waits, and what arrived is announced through a status region rather than left for
the reader to notice.

## days.ts

`groupByDay` and `dayKey` are exported on their own, for a feed that is not drawn by this component
or a server that pre-groups what it sends:

```ts
import { groupByDay } from '#lib/components/coral/kit/timeline/days.js';

groupByDay(events, (event) => event.createdAt, 'America/Bogota');
```
