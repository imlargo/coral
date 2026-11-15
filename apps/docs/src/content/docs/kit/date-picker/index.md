---
title: Date picker
description: A popover, a calendar and a formatted trigger. One day or two, with shortcuts.
group: Kit
category: Inputs
---

<script lang="ts">
	import Preview from '#lib/features/docs/components/Preview.svelte';
	import basicDemo from './demos/basic.svelte?demo';
	import rangeDemo from './demos/range.svelte?demo';
	import changesDemo from './demos/changes.svelte?demo';
	import presetsDemo from './demos/presets.svelte?demo';
	import boundsDemo from './demos/bounds.svelte?demo';
	import birthDemo from './demos/birth.svelte?demo';
	import formDemo from './demos/form.svelte?demo';
	import piecesDemo from './demos/pieces.svelte?demo';
</script>

The shadcn docs are honest about this one: there is no date picker component, there is a recipe. So
a picker means writing the same forty lines by hand (a popover, a trigger button, a `DateFormatter`,
a `getLocalTimeZone()`, an `open` flag that has to be closed by hand), each copy slightly different
from the last. Date picker is those lines, with the closing, the range and the formatting settled
once.

<Preview demo={basicDemo} />

## When to use

**Use it when**

- A form or a filter takes one day: a release date, an expiry for an API key.
- A filter takes a range, often with shortcuts: deployments or builds over the last 7 days.
- The day has to be submitted with a form as an ISO string.

**Reach for something else when**

- The calendar should stay on the page rather than in a popover: the shadcn `Calendar` or
  `RangeCalendar`.
- The value is a moment in time, not a day: the picker plus an `<Input type="time">` in its
  `footer`, since there is no time here.
- The date is shown, not picked: [relative time](/docs/kit/relative-time) for "3 hours ago".
- Several scattered days are picked at once: the shadcn `Calendar` with `type="multiple"`.

## Usage

```svelte
<script lang="ts">
	import DatePicker from '#lib/components/coral/kit/date-picker/date-picker.svelte';
	import type { DateValue } from '#lib/components/coral/kit/date-picker/types.js';

	let releaseDate = $state<DateValue>();
</script>

<DatePicker bind:value={releaseDate} aria-label="Release date" />
```

`onchange` fires when the user picks, never on mount and never when `value` is assigned from code.

## Examples

### Ranges

<Preview demo={rangeDemo} />

`type="range"` swaps the calendar for the range calendar and `value` for a `{ start, end }`. The
popover stays open through the middle of a selection and shuts when the second end lands.

A range is **half picked** for as long as it takes to click the second day: `value` carries a
`start` and no `end`, and the trigger prints that one day rather than falling back to the
placeholder. A picker that says "Pick a range" while a start day sits highlighted is lying
about its own state. It is also why the `trigger` snippet gets `empty` as a signal of its own
instead of testing `value === undefined`.

<Preview demo={changesDemo} />

**`onchange` skips the half state.** A whole range and a cleared one are both selections; half of
one is the user still mid-gesture, and a caller that fetches on change would otherwise fire a
request for a range with no end. Bind `value` if you do want every click.

### Presets

<Preview demo={presetsDemo} />

A preset is a label and the value it selects. **Give it as a function whenever it is relative to
now**:

```ts
const presets: Preset<DateRange>[] = [
	{ label: 'Today', value: () => ({ start: today(zone), end: today(zone) }) },
	{ label: 'Last 7 days', value: lastDays(7) }
];
```

A preset computed once at module scope is correct until midnight, and then quietly wrong for
everyone who left the tab open. The thunk is called when the row renders and again when it is
clicked, so both the highlight and the selection come from the clock as it is now.

Which brings up the part worth having: **the row knows which preset is active**, and the trigger
prints its label rather than the dates behind it. `Last 7 days` is what the user chose; making
them recognise it as `Aug 24 – 31` is asking them to do arithmetic to read their own selection.

Identity cannot answer that question. A thunk hands back a fresh `CalendarDate` on every call, so
`===` is always false. `activePreset` in
[`presets.ts`](https://github.com/imlargo/coral/blob/main/packages/coral/src/lib/components/coral/kit/date-picker/presets.ts)
compares the day fields instead, and is exported on its own for a preset row that lives outside the
popover.

### The calendar keeps everything it had

<Preview demo={boundsDemo} />

Unrecognised props go to the **calendar**, not to the popover: `minValue`, `maxValue`,
`numberOfMonths`, `isDateDisabled`, `isDateUnavailable`, `captionLayout`, `weekStartsOn`,
`fixedWeeks`, the `day` snippet, all of it.

<Preview demo={birthDemo} />

The popover's own surface is small on purpose, because a date picker only ever needs three knobs
from it (`open`, `align` and `contentClass`), and those are named props.

One rename: the calendar's `placeholder` (the month on screen, a `DateValue`) is Coral's **`month`**,
because `placeholder` is already the trigger's empty text everywhere else in Coral. Two props with
one name, one a string and one a date, is a coin flip every caller loses once.

### Forms

<Preview demo={formDemo} />

`name` puts the selection in the request as a field holding the ISO day, `2026-01-05`, which is
what `String(dateValue)` already gives you. A range submits two: `name`, and `endName` (defaulting
to `${name}-end`).

`form` points those fields at a form by `id`, for a picker that renders outside it. `required`
blocks submission while nothing is selected. On a range it holds for a half-picked one too, which
is the user mid-gesture rather than a selection.

### Formatting

`format` is passed straight to `Intl.DateTimeFormat`, so anything it understands works:

```svelte
<DatePicker bind:value format={{ dateStyle: 'full' }} />
<DatePicker bind:value format={{ day: '2-digit', month: 'long' }} />
```

Leave `timeZone` out of it. Coral turns the selected day into a `Date` at **local noon** and formats
that: a calendar day means that day where the reader is, and noon is the only hour no DST jump can
delete.

The trigger label is formatted, and a range is formatted _as a range_: `Jan 5 – 9, 2026`, one month
and one year, in whatever separator the locale uses. There is no `@internationalized/date` import
to write: `Intl` formats the day, and the calendar keeps owning the dates.

The recipe's `value.toDate(getLocalTimeZone())` hands `Intl` local midnight, and midnight is the one
instant a DST jump can delete. Where that happens, a hand-rolled picker prints the day before the
one that is selected.

### Empty, cleared and disabled

With nothing selected the trigger prints `placeholder` in muted text. `clearable` adds a clear
control beside the trigger once there is a selection; clearing calls `onchange` with `undefined`,
or an empty range. `disabled` blocks the trigger and the calendar and hides the clear control.

## Props

Everything the wrapped calendar accepts stays available. On top of that:

| Prop           | Type                                                    | Default                   | Description                                             |
| -------------- | ------------------------------------------------------- | ------------------------- | ------------------------------------------------------- |
| `type`         | `'single'` \| `'range'`                                 | `'single'`                | Decides the shape of `value`, `presets` and `onchange`. |
| `value`        | `DateValue` \| `DateRange`                              | -                         | The selection. Bindable.                                |
| `onchange`     | `(value) => void`                                       | -                         | Fired when the user picks a day, a preset, or clears.   |
| `open`         | `boolean`                                               | `false`                   | Popover state. Bindable.                                |
| `onOpenChange` | `(open: boolean) => void`                               | -                         | The reader opened or closed it. Not when `open` is set. |
| `month`        | `DateValue`                                             | today                     | The month on screen. Bindable. Follows the selection.   |
| `presets`      | `Preset<Value>[]`                                       | -                         | Shortcuts beside the calendar.                          |
| `placeholder`  | `string`                                                | `Select a date...`        | Trigger text while nothing is selected.                 |
| `locale`       | `string`                                                | `en-US`                   | Drives the calendar's strings and the trigger label.    |
| `format`       | `Intl.DateTimeFormatOptions`                            | `{ dateStyle: 'medium' }` | How the trigger prints the selection.                   |
| `clearable`    | `boolean`                                               | `false`                   | Adds a clear control to the trigger.                    |
| `clearLabel`   | `string`                                                | `Clear date`              | Accessible label for that control.                      |
| `disabled`     | `boolean`                                               | `false`                   | Blocks the trigger and the calendar.                    |
| `name`         | `string`                                                | -                         | Submits as a field holding the ISO day.                 |
| `endName`      | `string`                                                | `${name}-end`             | Field name for the end of a range.                      |
| `form`         | `string`                                                | -                         | `id` of the form, for a picker outside it.              |
| `required`     | `boolean`                                               | `false`                   | Blocks submission while nothing is selected.            |
| `serialize`    | `(value: DateValue) => string`                          | `String`                  | Turns a day into the submitted string.                  |
| `id`           | `string`                                                | generated                 | Put on the trigger, for a `<Label for>`.                |
| `aria-*`       | `aria-label`, `-labelledby`, `-describedby`, `-invalid` | -                         | Put on the trigger.                                     |
| `align`        | `'start'` \| `'center'` \| `'end'`                      | `'start'`                 | Which trigger edge the popover lines up with.           |
| `class`        | `string`                                                | -                         | Merged onto the trigger button.                         |
| `contentClass` | `string`                                                | -                         | Merged onto the popover content.                        |

### Snippets

| Snippet   | Receives                                                | Replaces                                  |
| --------- | ------------------------------------------------------- | ----------------------------------------- |
| `trigger` | `{ props, value, label, empty, open, disabled, clear }` | The whole trigger.                        |
| `footer`  | `{ value, clear, close }`                               | Nothing - it is added below the calendar. |

### `Preset<Value>`

| Field   | Type                     | Description                                                    |
| ------- | ------------------------ | -------------------------------------------------------------- |
| `label` | `string`                 | Shown on the shortcut, and on the trigger while it is active.  |
| `value` | `Value` \| `() => Value` | The selection it stands for. A function for anything relative. |

## Keyboard

The trigger opens the popover; inside it, the keys are the calendar primitive's, and focus is
trapped in the popover while it is open.

| Key               | Action                                                              |
| ----------------- | ------------------------------------------------------------------- |
| `Enter` / `Space` | On the trigger: opens the popover. On a day: selects it.            |
| `←` / `→`         | Previous or next day, into the next month at the edges.             |
| `↑` / `↓`         | The same weekday a week earlier or later.                           |
| `Tab`             | Moves between the presets, the month buttons and the calendar.      |
| `Escape`          | Closes the popover without picking; focus goes back to the trigger. |

## Accessibility

- **The popover closes itself**, and focus goes back to the trigger: after a day, after the second
  end of a range, and after a preset. The recipe leaves that to a hand-written `onValueChange`,
  which is where it gets forgotten.
- **Named on the trigger.** The trigger takes `id` and `aria-*`, so a `<Label for>` names it, and
  it carries `aria-required` when `required` is set.
- **Presets say which is active** with `aria-pressed`, and the trigger prints the active preset's
  label rather than the dates behind it.
- **The clear control sits beside the trigger**, not inside it: a button within a button is invalid
  HTML, and browsers recover by dropping one of the two. It is named by `clearLabel`.

## Customizing

- `class` is merged onto the trigger button, `contentClass` onto the popover content.
- Everything the calendar accepts is forwarded to it, as shown under
  [The calendar keeps everything it had](#the-calendar-keeps-everything-it-had).
- `placeholder`, `clearLabel` and `format` can be set once for the project with
  [`setCoralDefaults`](/docs/conventions#project-wide-defaults) under `kit/date-picker`; the shared
  `locale` drives the calendar and the trigger label.

The picker is the shadcn `Popover`, `Button` and `Calendar` or `RangeCalendar`. `presets.ts`
(`activePreset`, `resolvePreset`) and `format.ts` (`formatDay`, `formatDayRange`, `toLocalDate`)
are plain modules for a picker of your own. Dropping to the recipe means rebuilding the close and
focus hand-back, the range that waits for its second end, the formatted label, the active preset
and the form fields.

### The pieces

<Preview demo={piecesDemo} />

`trigger` replaces the button entirely and receives `label` already formatted, so a custom trigger
does not have to re-derive it. `footer` adds a strip below the calendar: a clear action, a hint, a
time field.

### Deliberately absent

- **No `type="multiple"`:** the shadcn calendar has it, and surfacing it here would add a third
  shape (an array) to `value`, to `presets` and to `onchange`, for a selection the trigger cannot
  print: a scattered set of days does not fold into one line of text the way a day or a range does.
- **No time:** a date and a time are two controls; the shadcn recipe itself puts an
  `<Input type="time">` next to the picker rather than inside it. Coral's `footer` is where that
  goes.
- **No natural-language parsing:** it needs `chrono-node`, it is English-only out of the box, and it
  is a text input that happens to sit beside a calendar (a different component, if it is ever
  written twice).
- **No `format` string:** `Intl.DateTimeFormatOptions` is the vocabulary the platform already has,
  and a bespoke `'dd/MM/yyyy'` mini-language is a formatter Coral would then have to own.
