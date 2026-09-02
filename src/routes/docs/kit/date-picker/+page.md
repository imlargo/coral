---
title: Date picker
description: A popover, a calendar and a formatted trigger. One day or two, with shortcuts.
---

<script lang="ts">
	import Preview from '$lib/docs/preview.svelte';
</script>

The shadcn docs are honest about this one: there is no date picker component, there is a recipe.
Every project writes the same forty lines - a popover, a trigger button, a `DateFormatter`, a
`getLocalTimeZone()`, an `open` flag that has to be closed by hand - and every project writes them
slightly differently.

<Preview name="kit/date-picker/basic" />

## What Coral adds

- **The popover closes itself**, and focus goes back to the trigger. The recipe leaves that to a
  hand-written `onValueChange`, which is where it gets forgotten.
- **A range closes when it is _complete_**, not on the first click - the single most common bug in a
  hand-rolled range picker.
- **The trigger label is formatted, and a range is formatted _as a range_**: `5 – 9 de ene de 2026`,
  one month and one year, in whatever separator the locale uses.
- **Presets know which of them is active**, which is the only reason a preset row is worth composing
  rather than writing inline.
- **No `@internationalized/date` import.** `Intl` formats the day; the calendar keeps owning the
  dates.
- **Days survive timezones and DST.** The recipe's `value.toDate(getLocalTimeZone())` hands `Intl`
  local midnight, and midnight is the one instant a DST jump can delete - where it does, the picker
  prints the day before the one that is selected.
- **`onchange` fires when the user picks**, never on mount and never when `value` is assigned from
  code.

## Ranges

<Preview name="kit/date-picker/range" />

`type="range"` swaps the calendar for the range calendar and `value` for a `{ start, end }`. The
popover stays open through the middle of a selection and shuts when the second end lands.

A range is **half picked** for as long as it takes to click the second day: `value` carries a
`start` and no `end`, and the trigger prints that one day rather than falling back to the
placeholder - a picker that says "Selecciona un rango" while a start day sits highlighted is lying
about its own state. It is also why the `trigger` snippet gets `empty` as a signal of its own
instead of testing `value === undefined`.

<Preview name="kit/date-picker/changes" />

**`onchange` skips the half state.** A whole range and a cleared one are both selections; half of
one is the user still mid-gesture, and a caller that fetches on change would otherwise fire a
request for a range with no end. Bind `value` if you do want every click.

## Presets

<Preview name="kit/date-picker/presets" />

A preset is a label and the value it selects. **Give it as a function whenever it is relative to
now**:

```ts
const presets: Preset<DateRange>[] = [
	{ label: 'Hoy', value: () => ({ start: today(zone), end: today(zone) }) },
	{ label: 'Últimos 7 días', value: lastDays(7) }
];
```

A preset computed once at module scope is correct until midnight, and then quietly wrong for
everyone who left the tab open. The thunk is called when the row renders and again when it is
clicked, so both the highlight and the selection come from the clock as it is now.

Which brings up the part worth having: **the row knows which preset is active**, and the trigger
prints its label rather than the dates behind it. `Últimos 7 días` is what the user chose; making
them recognise it as `24 – 31 de ago` is asking them to do arithmetic to read their own selection.

Identity cannot answer that question - a thunk hands back a fresh `CalendarDate` on every call, so
`===` is always false. `activePreset` in
[`presets.ts`](https://github.com/kora/coral/blob/main/src/lib/coral/kit/date-picker/presets.ts)
compares the day fields instead, and is exported on its own for a preset row that lives outside the
popover.

## The calendar keeps everything it had

<Preview name="kit/date-picker/bounds" />

Unrecognised props go to the **calendar**, not to the popover: `minValue`, `maxValue`,
`numberOfMonths`, `isDateDisabled`, `isDateUnavailable`, `captionLayout`, `weekStartsOn`,
`fixedWeeks`, the `day` snippet, all of it.

<Preview name="kit/date-picker/birth" />

The popover's own surface is small on purpose, because a date picker only ever needs three knobs
from it - `open`, `align` and `contentClass` - and those are named props.

One rename: the calendar's `placeholder` (the month on screen, a `DateValue`) is Coral's **`month`**,
because `placeholder` is already the trigger's empty text everywhere else in Coral. Two props with
one name, one a string and one a date, is a coin flip every caller loses once.

## Forms

<Preview name="kit/date-picker/form" />

`name` puts the selection in the request as a hidden input holding the ISO day - `2026-01-05`, which
is what `String(dateValue)` already gives you. A range submits two inputs: `name`, and `endName`
(defaulting to `${name}-end`).

## The pieces

<Preview name="kit/date-picker/pieces" />

`trigger` replaces the button entirely and receives `label` already formatted, so a custom trigger
does not have to re-derive it. `footer` adds a strip below the calendar - a clear action, a hint, a
time field.

## Formatting

`format` is passed straight to `Intl.DateTimeFormat`, so anything it understands works:

```svelte
<DatePicker bind:value format={{ dateStyle: 'full' }} />
<DatePicker bind:value format={{ day: '2-digit', month: 'long' }} />
```

Leave `timeZone` out of it. Coral turns the selected day into a `Date` at **local noon** and formats
that: a calendar day means that day where the reader is, and noon is the only hour no DST jump can
delete.

## Installation

```bash
pnpm dlx shadcn-svelte@latest add popover calendar range-calendar button
```

```svelte
<script lang="ts">
	import DatePicker from '$lib/coral/kit/date-picker/date-picker.svelte';
</script>
```

## Props

Everything the wrapped calendar accepts stays available. On top of that:

| Prop           | Type                               | Default                   | Description                                             |
| -------------- | ---------------------------------- | ------------------------- | ------------------------------------------------------- |
| `type`         | `'single'` \| `'range'`            | `'single'`                | Decides the shape of `value`, `presets` and `onchange`. |
| `value`        | `DateValue` \| `DateRange`         | -                         | The selection. Bindable.                                |
| `onchange`     | `(value) => void`                  | -                         | Fired when the user picks a day, a preset, or clears.   |
| `open`         | `boolean`                          | `false`                   | Popover state. Bindable.                                |
| `month`        | `DateValue`                        | today                     | The month on screen. Bindable. Follows the selection.   |
| `presets`      | `Preset<Value>[]`                  | -                         | Shortcuts beside the calendar.                          |
| `placeholder`  | `string`                           | `Select a date...`        | Trigger text while nothing is selected.                 |
| `locale`       | `string`                           | `es-CO`                   | Drives the calendar's strings and the trigger label.    |
| `format`       | `Intl.DateTimeFormatOptions`       | `{ dateStyle: 'medium' }` | How the trigger prints the selection.                   |
| `clearable`    | `boolean`                          | `false`                   | Adds a clear control to the trigger.                    |
| `clearLabel`   | `string`                           | `Clear date`              | Accessible label for that control.                      |
| `disabled`     | `boolean`                          | `false`                   | Blocks the trigger and the calendar.                    |
| `name`         | `string`                           | -                         | Submits as a hidden input holding the ISO day.          |
| `endName`      | `string`                           | `${name}-end`             | Field name for the end of a range.                      |
| `serialize`    | `(value: DateValue) => string`     | `String`                  | Turns a day into the submitted string.                  |
| `id`           | `string`                           | -                         | Put on the trigger, for a `<Label for>`.                |
| `align`        | `'start'` \| `'center'` \| `'end'` | `'start'`                 | Which trigger edge the popover lines up with.           |
| `class`        | `string`                           | -                         | Merged onto the trigger button.                         |
| `contentClass` | `string`                           | -                         | Merged onto the popover content.                        |

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

## Deliberately absent

- **No `type="multiple"`.** The shadcn calendar has it; nothing in the corpus has ever picked an
  arbitrary set of days out of a popover, and adding it would triple the number of value shapes for a
  case nobody has written.
- **No time.** A date and a time are two controls - the shadcn recipe itself puts an
  `<Input type="time">` next to the picker rather than inside it. Coral's `footer` is where that
  goes.
- **No natural-language parsing.** It needs `chrono-node`, it is English-only out of the box, and it
  is a text input that happens to sit beside a calendar - a different component, if it is ever
  written twice.
- **No `format` string.** `Intl.DateTimeFormatOptions` is the vocabulary the platform already has,
  and a bespoke `'dd/MM/yyyy'` mini-language is a formatter Coral would then have to own.
