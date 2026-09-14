---
title: Tags input
description: A field that turns typed and pasted text into tags, with one rule for both.
---

<script lang="ts">
	import Preview from '$lib/docs/preview.svelte';
</script>

A tags field is an input, a row of badges and about eighty lines of keyboard handling nobody enjoys
writing twice. The eighty lines are the component: what separates one tag from the next, what
happens to a paste, what Backspace does when the field is empty, and where focus goes after a tag
is taken out.

<Preview name="kit/tags-input/basic" />

## What Coral adds

- **One rule for typed and pasted text.** The delimiter separates tags wherever the text came from,
  so `red, blue` is two tags whether it was typed or pasted. Newlines separate too - a column out of
  a spreadsheet arrives as tags, not as one tag with line breaks in it.
- **Nothing is lost on the way out.** Leaving the field with something half-typed in it turns that
  into a tag instead of dropping it.
- **The keyboard reaches the tags.** Backspace on an empty field steps onto the last tag; Backspace
  again removes it. Arrows walk the row, Escape goes back to the field, and typing anywhere in
  there lands in the field again.
- **Focus never falls on the floor.** Removing a tag moves focus to the next one, or back to the
  field when the last one goes - not to `<body>`.
- **Rejections are reported, not guessed.** A duplicate, a failed `validate` or a full list arrives
  at `onreject` with the reason. The message is the project's; Coral does not write copy.
- **It submits like a list.** One hidden input per tag, which is what a server already reads.

Everything else is the primitive's: `input-group` draws the box, and the focus ring, the disabled
dimming and `aria-invalid` come from it reacting to the field inside - so a tags input sits next to
a plain input without either of them being told what a field looks like.

## Delimiters and pasting

The `delimiter` is a comma by default, and a newline always separates as well - a single-line field
cannot hold one, so there is nothing to lose by cutting there. Pass a string, a regular expression,
or `''` to leave newlines as the only separator.

The fragment after the last delimiter stays in the field. Pasting `red, blue` leaves `blue` being
typed, which is where it would have ended up if the paste had no trailing comma either - and it
becomes a tag on Enter, or on the way out of the field.

There is no `addOnPaste` switch on purpose. With one, the same string becomes two tags or one
depending on how it got into the field.

## Limits and rejections

<Preview name="kit/tags-input/limits" />

`max` caps the list, `allowDuplicates` opens or closes the door on repeats, and both report what
they turned away through `onreject` - one call per batch, so a paste of thirty over the cap is one
message, not thirty.

Coral says nothing on screen about it. What "no caben más de 4" reads like is the project's, and a
component that ships that sentence ships a language with it.

## Rules

<Preview name="kit/tags-input/rules" />

`sanitize` runs before anything is judged or stored - trimming by default, but lowercasing, or
stripping a leading `#`, belongs here too. `validate` then decides whether the value is a tag at
all. Both apply to typing, to pasting and to the value committed on blur, because all three go
through the same door.

`validate` receives the tags as they stand, not as they arrived, so a pasted batch is judged
against what the values before it already added.

## Forms

<Preview name="kit/tags-input/form" />

`name` posts one hidden input per tag, which `FormData.getAll(name)` reads back as a list. The
visible field never carries the name: it holds what is being typed, which is precisely what has not
been added yet.

`required` is enforced while the list is empty and released as soon as it is not - so the browser's
own validation guards the tags, and never blocks a submit over text left half-typed in the field.

## Custom tags

<Preview name="kit/tags-input/custom" />

The `tag` snippet replaces the body of each tag - an icon, an avatar, a count. The remove control
stays, along with its label and its place in the keyboard order. `tagVariant`, `tagClass`,
`inputClass` and `class` cover the rest without a snippet.

## Readonly, disabled, clearable

<Preview name="kit/tags-input/states" />

Both `readonly` and `disabled` drop the remove controls: nothing about a field that cannot be
edited should offer to edit it. `clearable` adds one control that empties the list and puts focus
back in the field.

## Keyboard

| Key                    | Where            | What it does                                           |
| ---------------------- | ---------------- | ------------------------------------------------------ |
| `Enter`                | Field, non-empty | Adds the tag. Empty, it is left to the form to submit. |
| The delimiter          | Field            | Adds the tag, same as `Enter`.                         |
| `Backspace`            | Empty field      | Steps onto the last tag.                               |
| `Backspace` / `Delete` | On a tag         | Removes it, and stays on the one that takes its place. |
| `←` / `→`              | On a tag         | Walks the row. Past the last one is the field again.   |
| `←`                    | Empty field      | Steps onto the last tag.                               |
| `Escape`               | On a tag         | Back to the field.                                     |
| Any printable key      | On a tag         | Back to the field, with the character typed.           |
| `Tab`                  | Anywhere         | The remove controls are real buttons, in order.        |

Arrow directions are read off the element, so they reverse inside an RTL subtree without being told.

## Installation

```bash
pnpm dlx shadcn-svelte@latest add input-group badge
```

```svelte
<script lang="ts">
	import TagsInput from '$lib/coral/kit/tags-input/tags-input.svelte';
</script>
```

## Props

Everything the shadcn input accepts stays available on the field - `placeholder`, `id`, `aria-*`,
`maxlength`, `autocomplete`, `ref`. On top of that:

| Prop              | Type                                         | Default               | Description                                               |
| ----------------- | -------------------------------------------- | --------------------- | --------------------------------------------------------- |
| `value`           | `string[]`                                   | `[]`                  | The tags. Bindable.                                       |
| `inputValue`      | `string`                                     | `''`                  | The text being typed. Bindable.                           |
| `onchange`        | `(tags: string[]) => void`                   | -                     | Fired when the list changes. Never on mount.              |
| `onreject`        | `(rejected: TagRejection[]) => void`         | -                     | Fired once per batch with everything turned away.         |
| `delimiter`       | `string \| RegExp`                           | `,`                   | What separates tags. Newlines always do too.              |
| `max`             | `number`                                     | -                     | How many tags fit. Extras are reported to `onreject`.     |
| `allowDuplicates` | `boolean`                                    | `false`               | Whether the same tag may be held twice.                   |
| `validate`        | `(value: string, tags: string[]) => boolean` | -                     | Return `false` to turn a value away.                      |
| `sanitize`        | `(raw: string) => string`                    | trim                  | Cleans a value before it is judged and stored.            |
| `addOnBlur`       | `boolean`                                    | `true`                | Whether leaving the field turns what is in it into a tag. |
| `clearable`       | `boolean`                                    | `false`               | Adds a control that empties the list.                     |
| `clearLabel`      | `string`                                     | `Clear all`           | Accessible label for that control.                        |
| `removeLabel`     | `(value: string) => string`                  | `` `Remove ${tag}` `` | Accessible label for a tag's remove control.              |
| `required`        | `boolean`                                    | `false`               | Requires at least one tag before the form submits.        |
| `name`            | `string`                                     | -                     | Submits the tags as one hidden input per tag.             |
| `disabled`        | `boolean`                                    | `false`               | Blocks the field and drops the remove controls.           |
| `readonly`        | `boolean`                                    | `false`               | Shows the tags without offering to change them.           |
| `tagVariant`      | `BadgeVariant`                               | `secondary`           | Which badge variant the tags are drawn with.              |
| `class`           | `string`                                     | -                     | Merged onto the box.                                      |
| `inputClass`      | `string`                                     | -                     | Merged onto the field.                                    |
| `tagClass`        | `string`                                     | -                     | Merged onto each tag.                                     |
| `tag`             | `Snippet<[{ value, index, remove }]>`        | -                     | Replaces the body of each tag. The remove control stays.  |

`oninput`, `onkeydown` and `onblur` are forwarded rather than swallowed. The caller's `onkeydown`
runs first, so calling `preventDefault` on it takes that key away from the component - which is how
a project bolts on a key of its own without forking the file.

## Accessibility

The field stays a native text input, so it keeps its label, its description, its placeholder and
its own validation. Each tag carries a real `<button>` labelled with the tag it removes - `Remove
vainilla`, not `Remove` - so the controls are reachable by Tab and named when they are reached. The
arrow keys are a shortcut over the top of that, not the only way in.

Focus is the highlight. There is no second notion of "the selected tag" to keep in sync with it,
nothing to announce that the browser does not announce already, and no roving `tabindex` to get
wrong. Removing a tag moves focus to the one that takes its place, or back to the field when the
list empties.

> **On editing a tag in place.** Some libraries let a double click turn a tag back into a text
> field. Coral does not: it is a mode people fall into by accident and cannot discover on purpose,
> and removing a short string and retyping it is two keystrokes. If a project genuinely needs it,
> that is a `tag` snippet - the pieces are exposed.

## tags.ts

The rules live in `kit/tags-input/tags.ts` and are exported on their own, so the same splitting and
validation can run where there is no field - normalising a payload, importing a CSV column.

```ts
import { add, split } from '$lib/coral/kit/tags-input/tags.js';

split('a, b\nc'); // ['a', ' b', 'c']
split('a;b', /[;,]/); // ['a', 'b']

add([' A ', 'a'], { current: [], sanitize: (raw) => raw.trim().toLowerCase() });
// { tags: ['a'], rejected: [{ value: 'a', reason: 'duplicate' }] }
```
