---
title: Select
description: A short list of known options, with the trigger label, the value mapping and the change signal already wired.
---

<script lang="ts">
	import Preview from '$docs/preview.svelte';
</script>

Wrapping a select is the first thing most projects do with the primitive and the last thing any of
them revisit: derive the trigger label, map the value in and out of the primitive's own keys,
decide what cleared means. Written by hand, no two copies of those few lines stay the same for long.

<Preview name="kit/select/basic" />

## What Coral adds

- **The trigger label derives itself.** The hand-rolled version opens with the same line every
  time: `options.find((o) => o.value === value)?.label ?? placeholder`.
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

Both open a `listbox` of `option`s. The difference is the trigger: a select's is a button, nothing
to type into, and the platform's own typeahead while it is focused and shut. A combobox's is a text
input, which announces itself as editable and sets the expectation that typing narrows the list.

That expectation is the whole point when there is a search behind it, and a liability when there is
not. Stripping the search out of a combobox leaves a text field that ignores what you type into it.

**There is no `type="multiple"` here, on purpose.** A multi-select is not a select with one more
prop: it needs a checkbox per row, badges in the trigger, and, as soon as the list is long enough
for anyone to want more than two of its entries, a search box. That component is the combobox.
Multiple selection arrives with search attached; keeping it out of `select` costs no one anything
and keeps this component the size of the problem it solves.

## Typed values

<Preview name="kit/select/typed-values" />

The obvious item key is `String(option.value)`, and it is lossy twice: two ids that stringify the
same collapse onto one item, and any object value becomes `[object Object]`, so every option in
the list shares a key. Coral keys items by their position instead, which cannot collide with
itself, and hands the value back untouched.

## Groups

<Preview name="kit/select/groups" />

Pass `OptionGroup[]` instead of `Option[]` and each run gets a heading. Do not mix the two shapes in
one array: the first entry decides how the whole array is read.

## Clearable

<Preview name="kit/select/clearable" />

`clearable` does both halves of unsetting: a `✕` appears on the trigger, and re-picking the selected
option deselects it. Cleared means `undefined`, not `''`. An empty string is a value, and a field
that reports one when nothing is selected pushes the check onto every caller.

The clear control sits beside the trigger rather than inside it. The trigger is a `<button>`, and a
button nested in a button is invalid HTML that browsers recover from by dropping one of the two.

## Forms

<Preview name="kit/select/form" />

`name` renders the field that submits. It is Coral's own rather than the primitive's, because
bits-ui would submit the internal item key. `serialize` controls what gets written; it defaults to
`String`, which is right for ids, numbers and enum members and wrong for objects, so set it when `T`
is not a primitive.

`form` points the field at a form by `id`, for a select that renders outside it: a portalled
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
	import Select from '$lib/components/coral/kit/select/select.svelte';
	import type { Option } from '$lib/components/coral/lib/options.js';
</script>
```

## Props

Everything the shadcn root accepts stays available: `open`, `onOpenChange`, `loop`,
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

Shared with the combobox, from `$lib/components/coral/lib/options.js`:

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

The `trigger` snippet replaces the label, not the button: the chevron and the trigger element
belong to the primitive. For a trigger that is not a button-with-a-label at all, use the combobox's
`trigger` snippet, which replaces the whole element.
