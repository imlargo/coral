---
title: Inline edit
description: Text that turns into a field in place - rename a project, a column, a file.
group: Kit
category: Inputs
---

<script lang="ts">
	import Preview from '#lib/features/docs/components/Preview.svelte';
	import basicDemo from './demos/basic.svelte?demo';
	import asyncDemo from './demos/async.svelte?demo';
</script>

Rename-in-place has more states than it looks: showing, editing, saving, rejected. The usual version
swaps a span for an input on click and handles two of them: leaving the keyboard with no way in,
the Escape key closing the dialog it sits in, and a failed rename throwing away what was typed.

<Preview demo={basicDemo} />

## When to use

**Use it when**

- One text value is renamed where it is shown: a project name, a column header, a file.
- The edit saves on its own, with no form around it and no submit button.
- A menu item should be able to start the edit, through a bound `editing`.

**Reach for something else when**

- Several fields change together, or the change needs explaining: a form in a
  [responsive dialog](/docs/kit/responsive-dialog).
- The text runs over several lines: [textarea](/docs/kit/textarea) inside a form.
- The value comes from a fixed list: [select](/docs/kit/select) or [combobox](/docs/kit/combobox).
- There is no value to edit, only a request to send: [action button](/docs/kit/action-button).

## Usage

```svelte
<script lang="ts">
	import InlineEdit from '#lib/components/coral/kit/inline-edit/inline-edit.svelte';

	let name = $state('api-gateway');
</script>

<InlineEdit bind:value={name} required />
```

Enter saves, Escape cancels, and leaving the field saves. `saveOnBlur={false}` makes leaving the
field cancel instead. Unchanged text closes the field without calling `onsave`.

## Examples

### Saving to a server

<Preview demo={asyncDemo} />

`onsave` can be async. Return `false` or throw and the field stays open with the text as typed, to
be corrected rather than retyped; `onerror` receives what was thrown. `value` only changes once a
save goes through.

While saving, the field is `readonly` rather than `disabled`: disabling a focused field blurs it, and
that blur would read as the reader leaving: saving a second time, or cancelling a save already on
its way.

### Validation

`required` refuses empty text, `validate` refuses anything else, and `sanitize` (trimming, by
default) runs before both. A refused edit marks the field `aria-invalid` and stays open. What to say
about it is copy, and copy is the project's. Render the message next to the component.

### Starting from a menu

`editing` is bindable: set it to `true` from a menu item and the field opens with the saved value,
focused, and its text selected unless `selectOnEdit` is off. Every way in starts from the saved
value, never from a draft left over by an abandoned edit.

### Empty and disabled

While `value` is empty, the button shows `placeholder` in muted text, and the field shows it too.
`disabled` keeps the value on screen and stops the button from starting an edit.

## Props

Everything the shadcn input accepts goes to the field while editing: `maxlength`, `aria-*`,
`autocomplete`. On top of that:

| Prop           | Type                                | Default        | Description                                                 |
| -------------- | ----------------------------------- | -------------- | ----------------------------------------------------------- |
| `value`        | `string`                            | `''`           | Bindable. Only changes once a save goes through.            |
| `editing`      | `boolean`                           | `false`        | Bindable. Set `true` to start an edit from a menu.          |
| `onsave`       | `(value: string) => unknown`        | -              | Async-aware. `false` or throw keeps the field open.         |
| `onerror`      | `(error: unknown) => void`          | -              | What `onsave` threw. The field stays open, text as typed.   |
| `oncancel`     | `() => void`                        | -              | Escape, or blur with `saveOnBlur` off.                      |
| `validate`     | `(value: string) => boolean`        | -              | `false` refuses the text.                                   |
| `sanitize`     | `(raw: string) => string`           | trim           | Cleans text before validating and saving.                   |
| `required`     | `boolean`                           | `false`        | Refuses empty text.                                         |
| `disabled`     | `boolean`                           | `false`        | The value still shows; the button no longer starts an edit. |
| `saveOnBlur`   | `boolean`                           | `true`         | Leaving the field saves. Off, it cancels.                   |
| `selectOnEdit` | `boolean`                           | `true`         | Selects the text when editing starts.                       |
| `placeholder`  | `string`                            | `''`           | Shown while empty, in both modes.                           |
| `editLabel`    | `(value: string) => string`         | `Edit {value}` | Accessible name of the value button.                        |
| `class`        | `string`                            | -              | Merged onto the value button and, while editing, the group. |
| `inputClass`   | `string`                            | -              | Merged onto the field.                                      |
| `display`      | `Snippet<[{ value, placeholder }]>` | -              | Replaces what the value button shows.                       |

## Keyboard

What the keys do depends on whether the value or the field has focus.

| Key               | Action                                                                  |
| ----------------- | ----------------------------------------------------------------------- |
| `Enter` / `Space` | On the value: starts editing.                                           |
| `F2`              | On the value: starts editing, as in a file manager.                     |
| `Enter`           | In the field: saves. Ignored while an input method is composing.        |
| `Escape`          | In the field: cancels. It stops there instead of also closing a dialog. |
| `Tab`             | In the field: leaves it, which saves, or cancels with `saveOnBlur` off. |

## Accessibility

- **Reachable.** The value is a real `<button>`: Tab reaches it and Enter and Space open it, without
  a `role` and a key handler bolted onto a span.
- **Named by what it says.** The default `editLabel` includes the visible value, so the accessible
  name contains the text on screen. That's what WCAG 2.5.3 asks of a control a voice-control user
  will address by what it says.
- **Focus comes back.** After Enter or Escape, focus returns to the value. After a click elsewhere
  it stays where the reader clicked.
- **States.** `aria-busy` is set while saving and `aria-invalid` after a refused edit. The spinner
  shown while saving is hidden from assistive technology.

## Customizing

- `class` is merged onto the value button and, while editing, onto the field's input group, so a
  heading keeps the same type in both states. `inputClass` is merged onto the field itself.
- `display` replaces what the value button shows; whatever it renders is the thing that gets
  clicked.
- `editLabel` can be set once for the project with
  [`setCoralDefaults`](/docs/conventions#project-wide-defaults) under `kit/inline-edit`.
- Everything the shadcn input accepts (`maxlength`, `autocomplete`, `aria-*`) goes to the field.

The field is the shadcn `InputGroup` with a `Spinner` addon while saving, and the save goes through
[`lib/action`](/docs/kit/action-button#libaction), the same pending flag and `false`-or-throw
convention as action button. Dropping to the raw primitives means rebuilding the two modes, the
focus hand-back, the Escape that stays inside a dialog, and the blur that must not count while a
save is in flight.
