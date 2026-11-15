---
title: Relative time
description: Timestamps like 5 minutes ago that stay true, in the reader's language, without a timer per second.
group: Kit
category: Data display
---

<script lang="ts">
	import Preview from '#lib/features/docs/components/Preview.svelte';
	import basicDemo from './demos/basic.svelte?demo';
	import liveDemo from './demos/live.svelte?demo';
	import cutoffDemo from './demos/cutoff.svelte?demo';
</script>

`relativeTime(date)` helpers get written once per project, and they share the same limits: the text
is computed at render and goes stale while the page is open, "60 minutes ago" shows up where "1 hour
ago" belongs, and the fix (a `setInterval` per timestamp) wakes a two-hundred-row table every
second to change nothing.

<Preview demo={basicDemo} />

## When to use

**Use it when**

- A timestamp answers "how long ago": the last deployment, a build that just passed, a comment in
  an activity feed.
- The page stays open long enough for the label to go stale, such as a dashboard or a list of
  team members' last activity.
- A date in the near future reads better as a distance: a maintenance window "in 3 days".

**Reach for something else when**

- The exact date is what matters: a plan's renewal date, an API key's expiry. Format it with
  `Intl.DateTimeFormat`, or pass a `cutoff` so anything far away shows in full.
- The value is a duration to read exactly, like a build's running time or a countdown. Past 60
  seconds the label rounds to minutes; format the duration yourself with `Intl.NumberFormat`.

## Usage

```svelte
<script lang="ts">
	import RelativeTime from '#lib/components/coral/kit/relative-time/relative-time.svelte';

	const deployedAt = '2026-11-15T09:30:00Z';
</script>

Deployed <RelativeTime date={deployedAt} />
```

`date` takes a `Date`, an ISO string or a timestamp. The wording comes from
`Intl.RelativeTimeFormat`: "yesterday", "in 3 days", "hace 5 minutos", "5 分前", in any locale, in
`long`, `short` or `narrow`.

## Examples

### Live

<Preview demo={liveDemo} />

`precision="minute"`, the default, reads anything within half a minute as "now", since a label
ticking every second draws the eye for no reason. Use `second` where the seconds matter.

Each instance sleeps until the exact moment its own text changes: "3 days ago" wakes up in hours,
not every second. A tab brought back to the foreground refreshes at once, since background timers
are throttled. With `live={false}` the text is computed once; with `now` pinned, nothing is
scheduled at all.

### Past a cutoff

<Preview demo={cutoffDemo} />

"40 days ago" is rarely what anyone wants to read about a deployment. Past `cutoff` milliseconds
the date is shown in full instead, formatted with `titleFormat`, and nothing is scheduled for it.
A future date past the cutoff wakes up again when it comes inside it.

### Rounding

The unit is picked on the rounded value, so 59 minutes 40 seconds is "1 hour ago", not "60 minutes
ago". Weeks give way to months at four, so four weeks never sits next to one month. Rounding is
symmetric: 2.5 minutes ago and in 2.5 minutes both round to 3.

### Invalid date

A `date` that does not parse renders an empty `<time>`, with no `datetime` and no `title`, and
schedules nothing.

## Props

Everything a `<time>` accepts stays available: `class`, `aria-*`, `id`. On top of that:

| Prop          | Type                                  | Default                                     | Description                                  |
| ------------- | ------------------------------------- | ------------------------------------------- | -------------------------------------------- |
| `date`        | `Date \| string \| number`            | -                                           | The moment to describe. Required.            |
| `locale`      | `string`                              | `en-US`                                     | Wording and absolute date.                   |
| `numeric`     | `'auto' \| 'always'`                  | `auto`                                      | "yesterday" versus "1 day ago".              |
| `format`      | `'long' \| 'short' \| 'narrow'`       | `long`                                      | Length of the wording.                       |
| `precision`   | `'second' \| 'minute'`                | `minute`                                    | Smallest unit shown.                         |
| `live`        | `boolean`                             | `true`                                      | Keeps the text current.                      |
| `cutoff`      | `number`                              | -                                           | Milliseconds past which the full date shows. |
| `titleFormat` | `Intl.DateTimeFormatOptions`          | `{ dateStyle: 'long', timeStyle: 'short' }` | The absolute date's format.                  |
| `now`         | `Date`                                | -                                           | Pins the clock - tests, previews, snapshots. |
| `children`    | `Snippet<[{ text, absolute, date }]>` | -                                           | Replaces the text inside `<time>`.           |

## Keyboard

Nothing to operate: the component renders a `<time>`, which is not focusable, and the keyboard
passes over it like any other text.

## Accessibility

- **A real `<time>`.** `datetime` carries the exact instant for machines, and `title` the full date
  for whoever hovers. Past the `cutoff`, where the text already is the full date, `title` is left
  off.
- **Read as spoken.** A screen reader reads the relative text, which is what a person would say out
  loud.
- **Not a live region.** A label moving from "4 minutes ago" to "5 minutes ago" is not announced; a
  reader hears the current text when they reach it.

## Customizing

- **`class`** and every other `<time>` attribute land on the `<time>` element itself.
- **`children`** replaces the text inside the `<time>` and receives `text`, `absolute` and the
  parsed `date`, so a label like "Deployed 5 minutes ago" can be built around it while the element
  keeps its `datetime` and `title`.
- **Project-wide defaults.** `numeric`, `format`, `precision`, `cutoff` and `titleFormat` can be
  stated once under `'kit/relative-time'` with `setCoralDefaults`, and `locale` through the shared
  one: see [Project-wide defaults](/docs/conventions#project-wide-defaults). A prop at the call
  site still wins.

Dropping to a hand-written `<time>` means rebuilding the scheduler that wakes each label at its next
boundary, the refresh on returning to the tab, and the clock correction after server rendering.

### relative.ts

`describe` and `nextChange` are exported for use outside a component, such as a label in an email or
a server-rendered feed:

```ts
import { describe } from '#lib/components/coral/kit/relative-time/relative.js';

const { value, unit } = describe(new Date(comment.createdAt), new Date());
// `undefined` is the reader's own locale; pass one to pin it.
new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' }).format(value, unit); // "5 minutes ago"
```

Months and years are average lengths, so a relative label is approximate by nature. For "on 12
March", use the absolute date.
