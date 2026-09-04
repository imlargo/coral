---
title: Select
description: A short list of known options, with the trigger label, the value mapping and the change signal already wired.
---

<script lang="ts">
	import Preview from '$lib/docs/preview.svelte';
</script>

Six of the nine projects in the corpus use a select - 159 files. Four of them wrote a generic
wrapper for it, and two of those four are the same file: `suntalk` and `butter` are byte-identical
apart from one added `disabled?: boolean`. They have since drifted anyway.

<Preview name="kit/select/basic" />

## What Coral adds

- **The trigger label derives itself.** Every wrapper in the corpus opens with the same line -
  `options.find((o) => o.value === value)?.label ?? placeholder`.
- **The value keeps its type.** `options` is `Option<T>[]`, so a numeric id goes in and a numeric id
  comes out. bits-ui keys items by string; the mapping happens here, once.
- **`onchange` fires when the user changes something.** Not on mount, not when `value` is assigned
  from code.
- **Typeahead works with the list closed**, the way a native `<select>` does, because the labels are
  handed to the primitive up front.
- **Groups, descriptions and a clear control** come with the same `Option<T>` the combobox uses.

## Select or combobox?

They are not interchangeable and the boundary is worth stating once:

| Use            | When                                                                             |
| -------------- | -------------------------------------------------------------------------------- |
| **`select`**   | The list is short and known - a status, a role, a priority. No search.           |
| **`combobox`** | The list is long, needs a search box, comes from the server, or is multi-select. |

Both open a `listbox` of `option`s - the difference is the trigger. A select's is a button: nothing
to type into, and the platform's own typeahead while it is focused and shut. A combobox's is a text
input, which announces itself as editable and sets the expectation that typing narrows the list.

That expectation is the whole point when there is a search behind it, and a liability when there is
not. Stripping the search out of a combobox leaves a text field that ignores what you type into it.

**There is no `type="multiple"` here, on purpose.** The one project in the corpus that needed a
multi-select did not extend its select - it hand-rolled 200 lines of Popover, Checkbox, Badge and
Input, and the first thing it added was a search box. That component is the combobox. Multiple
selection arrives with search attached; keeping it out of `select` costs no one anything and keeps
this component the size of the problem it solves.

## Typed values

<Preview name="kit/select/typed-values" />

Three of the four wrappers in the corpus reached for `String(option.value)` as the item key. It is
lossy twice: two ids that stringify the same collapse onto one item, and any object value becomes
`[object Object]` - so every option in the list shares a key. Coral keys items by their position
instead, which cannot collide with itself, and hands the value back untouched.

## Groups

<Preview name="kit/select/groups" />

Pass `OptionGroup[]` instead of `Option[]` and each run gets a heading. Do not mix the two shapes in
one array - the first entry decides how the whole array is read.

## Clearable

<Preview name="kit/select/clearable" />

`clearable` does both halves of unsetting: a `✕` appears on the trigger, and re-picking the selected
option deselects it. Cleared means `undefined`, not `''` - an empty string is a value, and a field
that reports one when nothing is selected pushes the check onto every caller.

The clear control sits beside the trigger rather than inside it. The trigger is a `<button>`, and a
button nested in a button is invalid HTML that browsers recover from by dropping one of the two.

## Forms

<Preview name="kit/select/form" />

`name` renders the field that submits. It is Coral's own rather than the primitive's, because
bits-ui would submit the internal item key. `serialize` controls what gets written; it defaults to
`String`, which is right for ids, numbers and enum members and wrong for objects - set it when `T`
is not a primitive.

`form` points the field at a form by `id`, for a select that renders outside it - a portalled
dialog, a sticky toolbar. `required` blocks submission while nothing is selected.

> The field is clipped to a pixel rather than `type="hidden"`, because a hidden input is barred
> from constraint validation and `required` on one does nothing at all. It stays out of the tab
> order and out of the accessibility tree; the only thing that reaches it is the browser's own
> validation message.

## Installation

```bash
pnpm dlx shadcn-svelte@latest add select button
```

```svelte
<script lang="ts">
	import Select from '$lib/coral/kit/select/select.svelte';
	import type { Option } from '$lib/coral/lib/options.js';
</script>
```

## Props

Everything the shadcn root accepts stays available - `open`, `onOpenChange`, `loop`,
`scrollAlignment`, `autocomplete`. On top of that:

| Prop           | Type                                             | Default               | Description                                     |
| -------------- | ------------------------------------------------ | --------------------- | ----------------------------------------------- |
| `options`      | `Option<T>[] \| OptionGroup<T>[]`                | -                     | The list, flat or grouped.                      |
| `value`        | `T`                                              | -                     | Bindable. Matched with `===`.                   |
| `onchange`     | `(option: Option<T> \| undefined) => void`       | -                     | User-driven changes only. Never on mount.       |
| `placeholder`  | `string`                                         | `Select an option...` | Shown while nothing is selected.                |
| `disabled`     | `boolean`                                        | `false`               | Blocks the trigger.                             |
| `clearable`    | `boolean`                                        | `false`               | Adds a clear control; re-picking deselects.     |
| `clearLabel`   | `string`                                         | `Clear selection`     | Accessible label for the clear control.         |
| `name`         | `string`                                         | -                     | Submits with a surrounding form.                |
| `form`         | `string`                                         | -                     | `id` of the form, for a select outside it.      |
| `required`     | `boolean`                                        | `false`               | Blocks submission while nothing is selected.    |
| `serialize`    | `(value: T) => string`                           | `String`              | What the field writes. Required for object `T`. |
| `size`         | `'sm' \| 'default'`                              | `'default'`           | Trigger height, from the primitive.             |
| `class`        | `string`                                         | -                     | Merged onto the trigger.                        |
| `contentClass` | `string`                                         | -                     | Merged onto the dropdown.                       |
| `trigger`      | `Snippet<[{ selected, placeholder, disabled }]>` | -                     | Replaces the label inside the trigger.          |
| `option`       | `Snippet<[{ option, selected }]>`                | -                     | Replaces the body of each row. The check stays. |

### `Option<T>`

Shared with the combobox, from `$lib/coral/lib/options.js`:

| Field         | Type       | Description                                                   |
| ------------- | ---------- | ------------------------------------------------------------- |
| `value`       | `T`        | What the caller gets back.                                    |
| `label`       | `string`   | What is shown, and what typeahead searches.                   |
| `disabled`    | `boolean`  | Blocks selection. The option stays visible.                   |
| `description` | `string`   | Second line under the label.                                  |
| `keywords`    | `string[]` | Search synonyms. Read by the combobox; ignored by the select. |

## Accessibility

The primitive owns the listbox semantics, roving focus and typeahead. Coral adds two things: the
trigger gets an `aria-label` of the placeholder while nothing is selected, so a screen reader
announces what the control is for rather than reading the visible placeholder as if it were a
choice; and the clear control is a real button with `clearLabel` on it, outside the trigger, so it
is reachable by keyboard.

The `trigger` snippet replaces the label, not the button - the chevron and the trigger element
belong to the primitive. For a trigger that is not a button-with-a-label at all, use the combobox's
`trigger` snippet, which replaces the whole element.
