---
title: Timeline
description: Events grouped by the reader's own calendar days, read as a list with a time on every one, and grown with older ones without moving what was read.
group: Kit
category: Data display
---

<script lang="ts">
	import Preview from '#lib/features/docs/components/Preview.svelte';
	import basicDemo from './demos/basic.svelte?demo';
	import olderDemo from './demos/older.svelte?demo';
</script>

Audit logs, deployment histories, account activity: a product has several of these, and each one is
built again from styled `<div>`s. The day grouping is written by comparing date strings, which cuts a
day at UTC midnight rather than the reader's, so an evening deploy files under tomorrow. The list is
not a list, so a screen reader hears one run of text with no count and no time on anything. "Load
older" appends without a word, so nobody is told anything arrived.

<Preview demo={basicDemo} />

## When to use

**Use it when**

- Events are read by when they happened: an audit log, a deployment history, a project's activity.
- Days matter to the reader, so "Yesterday" and a date heading help more than a timestamp per row.
- The history is long and older events are fetched on demand.

**Reach for something else when**

- The order is a sequence of steps the reader moves through, not a record of the past: use
  [Stepper](/docs/kit/stepper).
- Only one timestamp needs to read "5 minutes ago": use [Relative time](/docs/kit/relative-time) on
  its own.
- Rows are compared by columns (who, what, environment, status) rather than read in order: a
  shadcn `Table`.

## Usage

```svelte
<script lang="ts">
	import Timeline from '#lib/components/coral/kit/timeline/timeline.svelte';

	const deployments = [
		{ id: 'd2', at: '2026-11-15T14:05:00Z', what: 'api-gateway to production' },
		{ id: 'd1', at: '2026-11-14T18:40:00Z', what: 'api-gateway to staging' }
	];
</script>

<Timeline items={deployments} getDate={(event) => event.at} getKey={(event) => event.id}>
	{#snippet item({ item })}
		Deployed {item.what}
	{/snippet}
</Timeline>
```

The `item` snippet is required: Coral does not know what a deploy or a comment looks like, only when
it happened. Days are cut in the reader's own zone through `Intl`, and the two most recent read
"Today" and "Yesterday" in the reader's language, then the formatted date.

## Examples

### Loading older events

<Preview demo={olderDemo} />

`hasMore` shows the control; `onloadmore` fetches and appends to `items`, and follows the
[action convention](/docs/conventions): return a promise and it waits, return `false` or throw and
nothing changes. Older events are appended below what was already read, so nothing above the
control moves. Once the list has grown, `loadedMessage` is announced with how many events came.

### One day for everybody

`timeZone` is left out for a personal history, where the reader's own day is the right one. An audit
log that every administrator must read the same way sets it, and every day line is cut there.

### Empty

With no events and `hasMore` off, the timeline shows shadcn's `Empty` with `emptyMessage` as its
title, or the `empty` snippet in its place. While `hasMore` is on, an empty list shows only the
control, since older events may still come.

### When loading fails

What `onloadmore` throws goes to `onerror`, and the list stays as it was so the reader can try
again. Without `onerror` the error is an unhandled rejection.

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

## Keyboard

The only control is the button that loads older events, a native button: `Tab` reaches it, and
`Enter` or `Space` presses it. The events themselves are text and links from your `item` snippet.

## Accessibility

Each day is a heading at `headingLevel`, so the H key walks the days, and its events are an ordered
list, so the count is read before them. Every event carries a `<time datetime>` with the exact
instant, printed as the reader's clock beside it. Older events are loaded by a real button that
keeps focus while it waits, marked `aria-busy` and `aria-disabled` rather than `disabled`, and what
arrived is announced through a status region rather than left for the reader to notice.

## Customizing

- **Class props.** `class` merges onto the root, `headingClass` onto each day's heading, `listClass`
  onto each day's `<ol>`, `itemClass` onto every event row.
- **Snippets.** `item` is what an event says; `heading` replaces a day heading's text and receives
  the `offset` in days from today, so a heading can read differently for recent days; `empty`
  replaces the empty state.
- **Project-wide defaults.** `timeZone`, `dayFormat`, `timeFormat`, `loadMoreLabel`,
  `loadedMessage` and `emptyMessage` can be stated once under `'kit/timeline'` with
  `setCoralDefaults`, and `locale` through the shared one: see
  [Project-wide defaults](/docs/conventions#project-wide-defaults).

Dropping to raw markup means rebuilding the grouping by the reader's calendar day, the localized
"Today" and "Yesterday", the heading and list structure, and the announced load of older events
with its busy button.

### days.ts

`groupByDay` and `dayKey` are exported on their own, for a feed that is not drawn by this component
or a server that pre-groups what it sends:

```ts
import { groupByDay } from '#lib/components/coral/kit/timeline/days.js';

groupByDay(events, (event) => event.createdAt, 'America/Bogota');
```
