---
title: Select
description: A short list of known options, with the trigger label, the value mapping and the change signal already wired.
group: Kit
category: Inputs
---

<script lang="ts">
	import Preview from '#lib/features/docs/components/Preview.svelte';
	import basicDemo from './demos/basic.svelte?demo';
	import typedValuesDemo from './demos/typed-values.svelte?demo';
	import groupsDemo from './demos/groups.svelte?demo';
	import clearableDemo from './demos/clearable.svelte?demo';
	import loadingDemo from './demos/loading.svelte?demo';
	import formDemo from './demos/form.svelte?demo';
</script>

Wrapping a select is the first thing most projects do with the primitive and the last thing any of
them revisit: derive the trigger label, map the value in and out of the primitive's own string
keys, decide what cleared means. Written by hand, no two copies of those few lines stay the same
for long, and each one opens with `options.find((o) => o.value === value)?.label ?? placeholder`.

Coral writes them once. The trigger label derives itself, a numeric id goes in and a numeric id
comes out, `onchange` fires when the user changes something (not on mount, not when `value` is
assigned from code), and typeahead works with the list closed, the way a native `<select>` does,
because the labels are handed to the primitive up front.

<Preview demo={basicDemo} />

## When to use

**Use it when**

- The list is short and known: a status, a role, a priority, an environment.
- The reader picks exactly one value and can scan every option without typing.
- The value is not a string (an id, an enum member) and should come back with its type.

**Reach for something else when**

- The list is long, comes from a server, or needs a search box: [Combobox](/docs/kit/combobox).
- Several values can be picked: [Combobox](/docs/kit/combobox) with `type="multiple"`.
- The options are countries: [Country select](/docs/kit/country-select) already has the list.

## Usage

```svelte
<script lang="ts">
	import Select from '#lib/components/coral/kit/select/select.svelte';
	import type { Option } from '#lib/components/coral/lib/options.js';

	const roles: Option[] = [
		{ value: 'owner', label: 'Owner' },
		{ value: 'admin', label: 'Admin' },
		{ value: 'member', label: 'Member' }
	];

	let role = $state<string>();
</script>

<Select options={roles} bind:value={role} placeholder="Select a role..." />
```

## Examples

### Typed values

<Preview demo={typedValuesDemo} />

The obvious item key is `String(option.value)`, and it is lossy twice: two ids that stringify the
same collapse onto one item, and any object value becomes `[object Object]`, so every option in
the list shares a key. Coral keys items by their position instead, which cannot collide with
itself, and hands the value back untouched.

### Groups

<Preview demo={groupsDemo} />

Pass `OptionGroup[]` instead of `Option[]` and each run gets a heading. Do not mix the two shapes in
one array: the first entry decides how the whole array is read. Groups, descriptions and the clear
control come with the same `Option<T>` the combobox uses.

### Clearable

<Preview demo={clearableDemo} />

`clearable` does both halves of unsetting: a `✕` appears on the trigger, and re-picking the selected
option deselects it. Cleared means `undefined`, not `''`. An empty string is a value, and a field
that reports one when nothing is selected pushes the check onto every caller.

The clear control sits beside the trigger rather than inside it. The trigger is a `<button>`, and a
button nested in a button is invalid HTML that browsers recover from by dropping one of the two.

### Options from a request

<Preview demo={loadingDemo} />

A select whose options arrive later opens, without this, onto an empty list, and the reader cannot
tell "nothing here" from "not here yet". `loading` adds a loading row under whatever options are
already listed and announces `loadingMessage`; a list that ends up with no options shows
`emptyMessage` instead. Both are drawn as an option nothing can pick, because a listbox may own
nothing else, and both are spoken only while the list is open.

### Disabled and invalid

`disabled` blocks the trigger and hides the clear control. A disabled option stays in the list and
cannot be picked. `aria-invalid` is put on the trigger, where shadcn's select draws its invalid
state.

### Forms

<Preview demo={formDemo} />

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

## Props

Everything the shadcn root accepts stays available: `open`, `onOpenChange`, `loop`,
`scrollAlignment`, `autocomplete`. On top of that:

| Prop             | Type                                                    | Default               | Description                                      |
| ---------------- | ------------------------------------------------------- | --------------------- | ------------------------------------------------ |
| `options`        | `Option<T>[] \| OptionGroup<T>[]`                       | -                     | The list, flat or grouped.                       |
| `value`          | `T`                                                     | -                     | Bindable. Matched with `===`.                    |
| `onchange`       | `(option: Option<T> \| undefined) => void`              | -                     | User-driven changes only. Never on mount.        |
| `placeholder`    | `string`                                                | `Select an option...` | Shown while nothing is selected.                 |
| `loading`        | `boolean`                                               | `false`               | A loading row under the options already listed.  |
| `loadingMessage` | `string`                                                | `Loading...`          | Shown, and announced, while `loading`.           |
| `emptyMessage`   | `string`                                                | `No options.`         | Shown, and announced, in a list with no options. |
| `disabled`       | `boolean`                                               | `false`               | Blocks the trigger.                              |
| `clearable`      | `boolean`                                               | `false`               | Adds a clear control; re-picking deselects.      |
| `clearLabel`     | `string`                                                | `Clear selection`     | Accessible label for the clear control.          |
| `name`           | `string`                                                | -                     | Submits with a surrounding form.                 |
| `form`           | `string`                                                | -                     | `id` of the form, for a select outside it.       |
| `required`       | `boolean`                                               | `false`               | Blocks submission while nothing is selected.     |
| `serialize`      | `(value: T) => string`                                  | `String`              | What the field writes. Required for object `T`.  |
| `size`           | `'sm' \| 'default'`                                     | `'default'`           | Trigger height, from the primitive.              |
| `id`             | `string`                                                | generated             | Put on the trigger, for a `<Label for>`.         |
| `aria-*`         | `aria-label`, `-labelledby`, `-describedby`, `-invalid` | -                     | Put on the trigger.                              |
| `class`          | `string`                                                | -                     | Merged onto the trigger.                         |
| `contentClass`   | `string`                                                | -                     | Merged onto the dropdown.                        |
| `trigger`        | `Snippet<[{ selected, placeholder, disabled }]>`        | -                     | Replaces the label inside the trigger.           |
| `option`         | `Snippet<[{ option, selected }]>`                       | -                     | Replaces the body of each row. The check stays.  |

### `Option<T>`

Shared with the combobox, from `#lib/components/coral/lib/options.js`:

| Field         | Type       | Description                                                   |
| ------------- | ---------- | ------------------------------------------------------------- |
| `value`       | `T`        | What the caller gets back.                                    |
| `label`       | `string`   | What is shown, and what typeahead searches.                   |
| `disabled`    | `boolean`  | Blocks selection. The option stays visible.                   |
| `description` | `string`   | Second line under the label.                                  |
| `keywords`    | `string[]` | Search synonyms. Read by the combobox; ignored by the select. |

## Keyboard

Focus stays on the trigger the whole time; the open list follows it through
`aria-activedescendant`.

| Key                           | Action                                                                              |
| ----------------------------- | ----------------------------------------------------------------------------------- |
| `Enter` / `Space` / `↓` / `↑` | On the closed trigger: opens the list.                                              |
| A letter                      | Selects the option whose label starts with it while shut; highlights it while open. |
| `↓` / `↑`                     | Highlights the next or previous option.                                             |
| `Page Down` / `Page Up`       | Moves the highlight ten options.                                                    |
| `Home` / `End`                | Highlights the first or last option.                                                |
| `Enter` / `Space`             | Picks the highlighted option and closes the list.                                   |
| `Escape` / `Alt` + `↑`        | Closes the list without picking.                                                    |
| `Tab`                         | Closes the list and moves on.                                                       |

## Accessibility

The primitive owns the listbox semantics, roving focus and typeahead. Coral adds three things:

- **A name, only when nothing else gives one.** While nothing is selected the trigger gets an
  `aria-label` of the placeholder, so a screen reader announces what the control is for rather than
  reading the visible placeholder as if it were a choice. It steps aside for an `aria-label` or
  `aria-labelledby` of yours, and for a `<label for>` pointing at the trigger's `id` - an
  `aria-label` written over an associated label silently replaces it, and a field labelled "Plan"
  would be announced as "Select an option...".
- **The combobox role.** The primitive leaves it off the trigger while setting `aria-haspopup` and
  `aria-activedescendant` on it, and a bare button may not carry the second. The trigger is the
  select-only combobox from the ARIA practices guide, it says which list it controls while that
  list is open, and the list is named after the trigger.
- **A clear control that is a real button** with `clearLabel` on it, outside the trigger, so it is
  reachable by keyboard.

`id`, `aria-label`, `aria-labelledby`, `aria-describedby` and `aria-invalid` go to the trigger, which
is what a `<Label for>` or a form library's control hands out. A list that is loading, or empty,
says so inside itself and through a live region, seen and heard, the way the combobox does.

## Customizing

`class` lands on the trigger and `contentClass` on the dropdown; `size` picks the primitive's
trigger height.

### Snippets

The `trigger` snippet replaces the label, not the button: the chevron and the trigger element
belong to the primitive. For a trigger that is not a button-with-a-label at all, use the combobox's
`trigger` snippet, which replaces the whole element. The `option` snippet replaces the body of each
row and keeps the check.

### Project-wide defaults

A project states its own `placeholder`, `emptyMessage`, `loadingMessage` and `clearLabel` once,
under `'kit/select'` in [`setCoralDefaults`](/docs/conventions#project-wide-defaults); a prop
passed at a call site still wins.

### The pieces

The select is drawn with shadcn's `select` and `button`, and reads `lib/options` for the option
shapes, `lib/list-status` and `lib/live-region` for the loading and empty rows, and
`lib/hidden-field` for the field that submits. Dropping to the raw shadcn select means writing back
the label derivation, the index keys that keep `T` intact, the `onchange` that ignores
programmatic assignments, the clear control, the fallback name and the combobox role.

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
