---
title: Password input
description: A password field with a visibility toggle that does not break password managers.
group: Kit
---

<script lang="ts">
	import Preview from '#lib/features/docs/components/Preview.svelte';
	import basicDemo from './demos/basic.svelte?demo';
	import formDemo from './demos/form.svelte?demo';
</script>

Switching `type` between `password` and `text` is one line, and it is the line that goes wrong: the
caret jumps to the start, the toggle announces itself as a different button after every press, and a
form submitted while the password is showing hands a password manager a plain text field, so the
offer to save it never comes.

<Preview demo={basicDemo} />

## When to use

**Use it when**

- The field is a credential: a sign-in password, a new password, the current one on a
  change-password form.
- The reader should be able to check what they typed before submitting.

**Reach for something else when**

- The secret is shown once and copied rather than typed, like a freshly created API key: a
  read-only shadcn `Input` with a [Copy button](/docs/kit/copy-button).
- The code is a fixed number of digits, like a one-time passcode: shadcn's `InputOTP`.

## Usage

```svelte
<script lang="ts">
	import PasswordInput from '#lib/components/coral/kit/password-input/password-input.svelte';

	let password = $state('');
</script>

<PasswordInput bind:value={password} name="password" aria-label="Password" />
```

## Examples

### Showing and hiding

- **Hidden again on submit.** The field goes back to `type="password"` inside the form's `submit`
  event, before the browser reads it, so saving and autofill keep working.
- **The caret stays put.** Selection is read before the switch and restored after it.
- **One toggle, one name:** `aria-pressed` carries the state, so "Show password, pressed" means what
  it says, instead of a name that flips between "Show" and "Hide" and never says which is current.
- **Caps Lock warning:** read with `getModifierState`, which catches a lock that was already on and
  does not get it backwards on macOS. Announced politely, cleared on blur.
- **Nothing sent to a spellchecker.** Spellcheck, autocorrect and autocapitalize are off. A shown
  password is a text field to the browser, and enhanced spellcheck services upload text fields.

### In a form

<Preview demo={formDemo} />

Show the password and submit: the form reports `type="password"`. Turn this off with
`hideOnSubmit={false}` only if the field is not a credential.

`autocomplete` defaults to `current-password`. Set `new-password` on sign-up and change-password
forms, which is what tells a password manager to offer a generated one.

### Disabled

`disabled` blocks the field and the toggle together.

## Props

Everything the shadcn input accepts stays available: `name`, `id`, `placeholder`, `required`,
`minlength`, `disabled`, `aria-*`. On top of that:

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

## Keyboard

Nothing beyond the native elements: the field takes typing, and `Tab` reaches the toggle, a real
button that `Enter` or `Space` presses. Caps Lock is read from every key press in the field.

## Accessibility

The toggle is a `type="button"` with `aria-pressed` and `aria-controls` pointing at the field, so it
never submits the form and assistive tech knows what it changes. Its name stays `toggleLabel` in
both states; the pressed state says which one is current. The Caps Lock warning is a polite status
message and the icon is hidden, so it is heard once rather than read as part of the field. It is
cleared when the field loses focus, since Caps Lock can change while focus is elsewhere.

## Customizing

`class` lands on the input and `groupClass` on the bordered group around the field, the indicator
and the toggle. The group is shadcn's `input-group`, so the focus ring and the disabled and invalid
states are the theme's.

The `capsLockIndicator` snippet replaces the icon, and renders only while Caps Lock is on. The
announcement comes from `capsLockLabel` through the component's own live region, not from the
snippet.

`toggleLabel` and `capsLockLabel` can be stated once under `'kit/password-input'` in
[`setCoralDefaults`](/docs/conventions#project-wide-defaults); a prop at the call site still wins.

`onkeydown`, `onkeyup` and `onblur` are forwarded to the field, after the component reads Caps
Lock. Dropping to a raw shadcn `input-group` means writing back the submit-time hide, the caret
restore, the `aria-pressed` toggle and the Caps Lock read and announcement.
