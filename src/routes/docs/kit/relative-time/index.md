---
title: Relative time
description: Timestamps like 5 minutes ago that stay true, in the reader's language, without a timer per second.
---

<script lang="ts">
	import Preview from '$lib/docs/preview.svelte';
</script>

`relativeTime(date)` helpers get written once per project, and they share the same limits: the text
is computed at render and goes stale while the page is open, "60 minutes ago" shows up where "1 hour
ago" belongs, and the fix - a `setInterval` per timestamp - wakes a two-hundred-row table every
second to change nothing.

<Preview name="kit/relative-time/basic" />

## What Coral adds

- **Stays current, cheaply.** Each instance sleeps until the exact moment its own text changes: "3
  days ago" wakes up in hours, not every second. A tab brought back to the foreground refreshes at
  once, since background timers are throttled.
- **Right units.** The unit is picked on the rounded value, so 59 minutes 40 seconds is "1 hour ago".
  Four weeks never sits next to one month.
- **Worded by `Intl`.** "ayer", "hace 5 minutos", "in 3 days" - any locale, `long`, `short` or `narrow`.
- **A real `<time>`.** `datetime` carries the instant for machines and `title` the full date for
  whoever hovers.
- **Symmetric.** 2.5 minutes ago and in 2.5 minutes both round to 3.

## Live

<Preview name="kit/relative-time/live" />

`precision="minute"`, the default, reads anything within half a minute as "now" - a label ticking
every second draws the eye for no reason. Use `second` where the seconds matter.

## Past a cutoff

<Preview name="kit/relative-time/cutoff" />

"40 days ago" is rarely what anyone wants to read about a document. Past `cutoff` milliseconds the
date is shown in full instead, formatted with `titleFormat`, and nothing is scheduled for it.

## Installation

No shadcn primitives.

```svelte
<script lang="ts">
	import RelativeTime from '$lib/coral/kit/relative-time/relative-time.svelte';
</script>
```

## Props

Everything a `<time>` accepts stays available - `class`, `aria-*`, `id`. On top of that:

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

## relative.ts

`describe` and `nextChange` are exported for use outside a component - a label in an email, a
server-rendered feed:

```ts
import { describe } from '$lib/coral/kit/relative-time/relative.js';

const { value, unit } = describe(new Date(comment.createdAt), new Date());
new Intl.RelativeTimeFormat('es-CO', { numeric: 'auto' }).format(value, unit); // "hace 5 minutos"
```

Months and years are average lengths - a relative label is approximate by nature. For "on 12 March",
use the absolute date.
