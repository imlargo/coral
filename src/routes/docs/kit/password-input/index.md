---
title: Password input
description: A password field with a visibility toggle that does not break password managers.
---

<script lang="ts">
	import Preview from '$lib/docs/preview.svelte';
</script>

Switching `type` between `password` and `text` is one line, and it is the line that goes wrong: the
caret jumps to the start, the toggle announces itself as a different button after every press, and a
form submitted while the password is showing hands a password manager a plain text field, so the
offer to save it never comes.

<Preview name="kit/password-input/basic" />

## What Coral adds

- **Hidden again on submit.** The field goes back to `type="password"` inside the form's `submit`
  event, before the browser reads it, so saving and autofill keep working.
- **The caret stays put.** Selection is read before the switch and restored after it.
- **One toggle, one name:** `aria-pressed` carries the state, so "Show password, pressed" means what
  it says, instead of a name that flips between "Show" and "Hide" and never says which is current.
- **Caps Lock warning:** read with `getModifierState`, which catches a lock that was already on and
  does not get it backwards on macOS. Announced politely, cleared on blur.
- **Nothing sent to a spellchecker.** Spellcheck, autocorrect and autocapitalize are off. A shown
  password is a text field to the browser, and enhanced spellcheck services upload text fields.

## In a form

<Preview name="kit/password-input/form" />

Show the password and submit: the form reports `type="password"`. Turn this off with
`hideOnSubmit={false}` only if the field is not a credential.

`autocomplete` defaults to `current-password`. Set `new-password` on sign-up and change-password
forms, which is what tells a password manager to offer a generated one.

## Installation

```bash
pnpm dlx shadcn-svelte@latest add input-group
```

```svelte
<script lang="ts">
	import PasswordInput from '$lib/coral/kit/password-input/password-input.svelte';
</script>
```

## Props

Everything the shadcn input accepts stays available: `name`, `id`, `placeholder`, `required`,
`minlength`, `aria-*`. On top of that:

| Prop                | Type                         | Default            | Description                                                 |
| ------------------- | ---------------------------- | ------------------ | ----------------------------------------------------------- |
| `value`             | `string`                     | -                  | Bindable.                                                   |
| `visible`           | `boolean`                    | `false`            | Bindable. Whether the password is shown.                    |
| `capsLock`          | `boolean`                    | `false`            | Bindable. Caps Lock at the last key press in the field.     |
| `hideOnSubmit`      | `boolean`                    | `true`             | Hides the password when its form submits.                   |
| `onvisiblechange`   | `(visible: boolean) => void` | -                  | The reader toggled visibility.                              |
| `autocomplete`      | `string`                     | `current-password` | Use `new-password` on sign-up forms.                        |
| `toggleLabel`       | `string`                     | `Show password`    | Accessible name of the toggle. The same in both states.     |
| `capsLockLabel`     | `string`                     | `Caps Lock is on`  | Announced, and the indicator's tooltip.                     |
| `class`             | `string`                     | -                  | Merged onto the input.                                      |
| `groupClass`        | `string`                     | -                  | Merged onto the bordered group.                             |
| `capsLockIndicator` | `Snippet`                    | -                  | Replaces the indicator. Render nothing to drop the warning. |

## Accessibility

The toggle is a `type="button"` with `aria-pressed` and `aria-controls` pointing at the field, so it
never submits the form and assistive tech knows what it changes. The Caps Lock warning is a polite
status message and the icon is hidden, so it is heard once rather than read as part of the field.
