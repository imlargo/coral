---
title: Inline edit
description: Text that turns into a field in place - rename a project, a column, a file.
---

<script lang="ts">
	import Preview from '$lib/docs/preview.svelte';
</script>

Rename-in-place has more states than it looks: showing, editing, saving, rejected. The usual version
swaps a span for an input on click and handles two of them: leaving the keyboard with no way in,
the Escape key closing the dialog it sits in, and a failed rename throwing away what was typed.

<Preview name="kit/inline-edit/basic" />

## What Coral adds

- **Reachable.** The value is a real button: Tab reaches it, Enter and Space open it, and F2 does too,
  as in every file manager.
- **Enter saves, Escape cancels, blur saves.** Escape stops there instead of also closing a dialog.
  `saveOnBlur={false}` makes leaving the field cancel instead.
- **Focus comes back.** After Enter or Escape, focus returns to the value. After a click elsewhere it
  stays where the reader clicked.
- **Waits, and survives rejection.** `onsave` can be async. Return `false` or throw and the field
  stays open with the text as typed, to be corrected rather than retyped.
- **Nothing to save, nothing saved.** Unchanged text closes the field without calling `onsave`.

## Saving to a server

<Preview name="kit/inline-edit/async" />

While saving, the field is `readonly` rather than `disabled`: disabling a focused field blurs it, and
that blur would read as the reader leaving: saving a second time, or cancelling a save already on
its way.

## Validation

`required` refuses empty text, `validate` refuses anything else, and `sanitize` (trimming, by
default) runs before both. A refused edit marks the field `aria-invalid` and stays open. What to say
about it is copy, and copy is the project's. Render the message next to the component.

## Installation

```bash
pnpm dlx shadcn-svelte@latest add input-group spinner
```

```svelte
<script lang="ts">
	import InlineEdit from '$lib/coral/kit/inline-edit/inline-edit.svelte';
</script>
```

## Props

Everything the shadcn input accepts goes to the field while editing: `maxlength`, `aria-*`,
`autocomplete`. On top of that:

| Prop           | Type                                | Default        | Description                                                 |
| -------------- | ----------------------------------- | -------------- | ----------------------------------------------------------- |
| `value`        | `string`                            | `''`           | Bindable. Only changes once a save goes through.            |
| `editing`      | `boolean`                           | `false`        | Bindable. Set `true` to start an edit from a menu.          |
| `onsave`       | `(value: string) => unknown`        | -              | Async-aware. `false` or throw keeps the field open.         |
| `oncancel`     | `() => void`                        | -              | Escape, or blur with `saveOnBlur` off.                      |
| `validate`     | `(value: string) => boolean`        | -              | `false` refuses the text.                                   |
| `sanitize`     | `(raw: string) => string`           | trim           | Cleans text before validating and saving.                   |
| `required`     | `boolean`                           | `false`        | Refuses empty text.                                         |
| `saveOnBlur`   | `boolean`                           | `true`         | Leaving the field saves. Off, it cancels.                   |
| `selectOnEdit` | `boolean`                           | `true`         | Selects the text when editing starts.                       |
| `placeholder`  | `string`                            | `''`           | Shown while empty, in both modes.                           |
| `editLabel`    | `(value: string) => string`         | `Edit {value}` | Accessible name of the value button.                        |
| `class`        | `string`                            | -              | Merged onto the value button and, while editing, the group. |
| `inputClass`   | `string`                            | -              | Merged onto the field.                                      |
| `display`      | `Snippet<[{ value, placeholder }]>` | -              | Replaces what the value button shows.                       |

## Accessibility

The default `editLabel` includes the visible value, so the accessible name contains the text on
screen. That's what WCAG 2.5.3 asks of a control a voice-control user will address by what it says.
`aria-busy` is set while saving and `aria-invalid` after a refused edit.
