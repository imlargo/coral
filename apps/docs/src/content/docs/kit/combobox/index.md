---
title: Combobox
description: A select with a search box, filtering the way accented text is actually typed.
group: Kit
category: Inputs
---

<script lang="ts">
	import Preview from '#lib/features/docs/components/Preview.svelte';
	import basicDemo from './demos/basic.svelte?demo';
	import accentsDemo from './demos/accents.svelte?demo';
	import onchangeDemo from './demos/onchange.svelte?demo';
	import multipleDemo from './demos/multiple.svelte?demo';
	import groupsDemo from './demos/groups.svelte?demo';
	import createDemo from './demos/create.svelte?demo';
	import remoteDemo from './demos/remote.svelte?demo';
	import customTriggerDemo from './demos/custom-trigger.svelte?demo';
	import typedValuesDemo from './demos/typed-values.svelte?demo';
</script>

shadcn builds the combobox out of a popover and a command menu, and its docs are explicit that this
is a recipe rather than a component: around fifty lines of markup, a `triggerRef`, and a
`closeAndFocusTrigger` that has to be written by hand every time. Hand-rolled, that recipe gets
pasted rather than read, and the parts it leaves out (accent handling first) are the ones that
quietly go missing.

The component resolves the behavior around shadcn's pieces: typing `acai` finds `Açaí`, where
Command's own matcher compares raw strings and finds nothing, and focus returns to the trigger after
a selection, so the next Tab continues through the form. The look is shadcn's, unchanged.

<Preview demo={basicDemo} />

## When to use

**Use it when**

- The list is long enough that people would rather type than scroll: repositories, team members,
  countries.
- Labels carry accents, synonyms or codes worth searching (`keywords`).
- The options come from a server search, or the reader may need to create one that is missing.
- Several values can be picked from the same list (`type="multiple"`).

**Reach for something else when**

- The list is short enough to scan at a glance: [Select](/docs/kit/select) has no search box to get
  in the way.
- The control runs commands rather than holding a value:
  [Command palette](/docs/kit/command-palette).
- The values are free text rather than picked from a list: [Tags input](/docs/kit/tags-input).

## Usage

```svelte
<script lang="ts">
	import Combobox from '#lib/components/coral/kit/combobox/combobox.svelte';

	const members = [
		{ value: 'amara', label: 'Amara Diallo' },
		{ value: 'wei', label: 'Wei Zhang' },
		{ value: 'sofia', label: 'Sofia Rossi' }
	];

	let reviewer = $state<string>();
</script>

<Combobox options={members} bind:value={reviewer} placeholder="Assign a reviewer..." />
```

## Examples

### Search

<Preview demo={accentsDemo} />

Both the search term and the label are folded before comparison: lower case, accents removed, `ñ`
to `n`. It matches how people type, not how the word is spelled.

Without the folding the control looks correct until someone types `acai` and the list comes back
empty. That failure only ever shows up for the users whose words carry accents.

### Reacting to a selection

`bind:value` keeps state in sync. `onchange` answers a different question: _the user just chose
something_. It receives the **selection**, in the same shape as `value` but hydrated into options:
`Option<T> | undefined` for a single select, `Option<T>[]` for a multiple one.

It does not also receive the raw value, because that would be the same fact twice: `option.value`
recovers it, and `bind:value` already has it. The reverse is not free: handed a bare value, a
caller who wants the label has to search the list it just passed in.

<Preview demo={onchangeDemo} />

It fires from the selection handler and nowhere else, so it never fires on mount and never fires
when `value` is assigned from code, as the button in that demo shows.

That distinction is the reason it exists rather than being left to the caller. Deriving the signal
from the value instead:

```svelte
<!-- Don't. Fires on mount, and on every programmatic assignment. -->
$effect(() => save(city));
```

is the usual shortcut, and it ships the same bug every time: an `onchange('')` on mount, before
anyone has touched the control.

Use `bind:value` when you only need the state, `onchange` when something should _happen_. Both
together is fine.

For `type="multiple"` the selection is the whole list, not the row that toggled, which is what
makes a bulk change legible too: `clear` reports `[]` and the footer's `selectAll` reports the whole
resulting selection.
A single changed row could only have reported nothing. When the delta is what matters, diff against
the previous value.

### Multiple selection

`type="multiple"` switches `value` to an array. The trigger collapses into badges plus a counter
past `maxDisplay`, and the popover stays open while picking. Choosing one of several is rarely
choosing the last one.

<Preview demo={multipleDemo} />

The `footer` snippet gets `selectAll`, `clear`, the current selection and everything passing the
filter, which is enough to build bulk actions without Coral guessing what they should say.

> `selectAll` adds what is visible to the selection rather than replacing it. With a search term
> active the two differ, and replacing would deselect the options the filter is hiding (silently,
> since they are exactly the rows the user cannot see).

> Badges in the trigger are not individually removable. A button nested inside a button is invalid
> HTML, and browsers recover by dropping one of the two, which is how a per-badge remove control
> ends up unreachable by keyboard. Deselect from the list, or use the clear control.

### Groups, descriptions and keywords

<Preview demo={groupsDemo} />

Pass groups instead of options and each gets a heading. `description` renders as a second line and
is searched. `keywords` are searched but never shown: synonyms, codes, an old name. Try `berry`,
`mango` or `citrus` in that demo.

Filtering removes rows rather than hiding them, so a group whose options all fail the search
disappears along with its heading. No empty section is left behind.

### Typed values

`Option<T>` is generic. The value stays whatever the project already has (an id, an enum member)
and comes back out the same type, with no conversion at the call site.

<Preview demo={typedValuesDemo} />

Options are matched with `===`, so object values compare by reference. `disabled` on an option is
forwarded to the command item.

### Creating options

<Preview demo={createDemo} />

`oncreate` adds a row that turns the search term into an option: a label, a project, a
team. It is offered only when no option is already called that, compared the way the search
compares, so `acai` never offers a second `Açaí`, and never while `loading`, when the option may be
in the results still on their way.

The handler receives the trimmed term and returns the new option; the combobox selects it and
keeps its label on the trigger before `options` has caught up. Add it to `options` yourself, since
the list is yours. Return `false`, or throw, and nothing is selected: the handler goes through the
same `lib/action` as every Coral handler that can fail, so a second Enter while the request is out
does not create the option twice, and `onerror` hears what went wrong.

### Server-side search

`onsearch` fires as the user types, debounced by `searchDebounce`. Fetch, hand the results back
through `options`, and set `shouldFilter={false}` so a list the server already filtered is not
filtered twice.

<Preview demo={remoteDemo} />

`loading` adds a loading row under the options already listed, and announces `loadingMessage`. The
previous results stay where they were and stay pickable while the next ones are on their way, so
the list does not blank on every keystroke. The search term is cleared when the popover closes, so
the next open starts from the full list rather than from whatever was typed last time.

**The selected label survives the results.** The trigger shows the option behind the bound value,
and with server-side search that option is often not in the latest results: the reader searched
for something else, or an edit form opened on a saved value the first page never contained. The
combobox remembers every option it has shown as selected, so once an option has been listed its
label stays on the trigger however the results change. For a saved value, hand its option in with
the first `options`, as the demo does for the repository it opens on: from then on it is
remembered.

### Empty, disabled and invalid

When the search matches nothing and there is no create row to offer, the list shows
`emptyMessage` as a row nothing can pick, and announces it. `disabled` blocks the trigger and hides
the clear control. `aria-invalid` is put on the trigger, where shadcn's button draws its invalid
state.

### Forms

`name` renders one field per selected value, so `type="multiple"` posts the shape
`FormData.getAll(name)` already reads back as a list. `form` points those fields at a form by `id`,
for a combobox that renders outside it. `required` blocks submission while nothing is selected.

The search term is forgotten whenever the popover closes - by Escape, by a pick, and by the
`close()` handed to a footer, which assigns `open` and is the close the primitive never reports. A
term left behind would filter the list before anyone had typed anything the next time.

Values are stringified with `String` by default, which is right for ids, numbers and enum members.
Object values need `serialize`, or they submit as `[object Object]`:

```svelte
<Combobox {options} bind:value name="project" serialize={(v) => String(v.id)} />
```

## Props

Everything the shadcn popover root accepts stays available: `open`, `onOpenChange`,
`onOpenChangeComplete`. On top of that:

| Prop                | Type                                                    | Default               | Description                                                     |
| ------------------- | ------------------------------------------------------- | --------------------- | --------------------------------------------------------------- |
| `options`           | `Option<T>[]` \| `OptionGroup<T>[]`                     | -                     | The list to choose from, flat or grouped.                       |
| `type`              | `'single'` \| `'multiple'`                              | `'single'`            | Decides the shape of `value` and `onchange`.                    |
| `value`             | `T` \| `T[]`                                            | -                     | The selection. Bindable.                                        |
| `onchange`          | `(selection) => void`                                   | -                     | Fired when the user picks, toggles or clears.                   |
| `open`              | `boolean`                                               | `false`               | Popover state. Bindable.                                        |
| `search`            | `string`                                                | `''`                  | The search term. Bindable.                                      |
| `onsearch`          | `(search: string) => void`                              | -                     | Fired as the user types. For server-side search.                |
| `searchDebounce`    | `number`                                                | `0`                   | Milliseconds to wait before `onsearch` fires.                   |
| `shouldFilter`      | `boolean`                                               | `true`                | Client-side filtering. `false` when the server filtered.        |
| `filter`            | `(option, search) => boolean`                           | folded match          | Replaces the built-in matching.                                 |
| `clearable`         | `boolean`                                               | `false`               | Adds a clear control; re-picking deselects.                     |
| `loading`           | `boolean`                                               | `false`               | Adds a loading row under the options already listed.            |
| `disabled`          | `boolean`                                               | `false`               | Blocks the trigger.                                             |
| `name`              | `string`                                                | -                     | Submits with a surrounding form, one field per value.           |
| `form`              | `string`                                                | -                     | `id` of the form, for a combobox outside it.                    |
| `required`          | `boolean`                                               | `false`               | Blocks submission while nothing is selected.                    |
| `serialize`         | `(value: T) => string`                                  | `String`              | Turns a value into the submitted string. Object values need it. |
| `maxDisplay`        | `number`                                                | `3`                   | Badges before collapsing into a counter.                        |
| `placeholder`       | `string`                                                | `Select an option...` | Trigger text while nothing is selected.                         |
| `searchPlaceholder` | `string`                                                | `Search...`           | Placeholder for the search box.                                 |
| `emptyMessage`      | `string`                                                | `No results found.`   | Shown, and announced, when the search matches nothing.          |
| `loadingMessage`    | `string`                                                | `Loading...`          | Shown, and announced, while `loading`.                          |
| `clearLabel`        | `string`                                                | `Clear selection`     | Accessible label for the clear control.                         |
| `oncreate`          | `(term) => Option<T> \| false \| Promise<...>`          | -                     | Adds a row that creates an option from the search term.         |
| `createLabel`       | `(term: string) => string`                              | `Create "term"`       | The create row's text.                                          |
| `onerror`           | `(error: unknown) => void`                              | -                     | Receives what `oncreate` threw.                                 |
| `id`                | `string`                                                | generated             | Put on the trigger, for a `<Label for>`.                        |
| `aria-*`            | `aria-label`, `-labelledby`, `-describedby`, `-invalid` | -                     | Put on the trigger.                                             |
| `align`             | `'start'` \| `'center'` \| `'end'`                      | `'start'`             | Which trigger edge the list lines up with.                      |
| `anchor`            | `HTMLElement`                                           | the trigger           | What the list lines up with and takes its width from.           |
| `class`             | `string`                                                | -                     | Merged onto the trigger button.                                 |
| `contentClass`      | `string`                                                | -                     | Merged onto the popover content.                                |
| `listClass`         | `string`                                                | -                     | Merged onto the scrolling list - e.g. its max height.           |

### Snippets

| Snippet     | Receives                                         | Replaces                              |
| ----------- | ------------------------------------------------ | ------------------------------------- |
| `trigger`   | `{ props, selected, open, disabled, clear }`     | The whole trigger.                    |
| `selection` | `{ selected }`                                   | The selection inside the trigger.     |
| `option`    | `{ option, selected }`                           | The body of a row.                    |
| `empty`     | -                                                | The contents of the empty row.        |
| `indicator` | -                                                | The contents of the loading row.      |
| `footer`    | `{ selected, visible, clear, selectAll, close }` | Nothing - it is added below the list. |

### Option

| Field         | Type       | Description                                     |
| ------------- | ---------- | ----------------------------------------------- |
| `value`       | `T`        | Matched with `===`.                             |
| `label`       | `string`   | Shown, and searched.                            |
| `description` | `string`   | Second line. Searched.                          |
| `keywords`    | `string[]` | Searched, never shown.                          |
| `disabled`    | `boolean`  | Blocks selection; stays visible and searchable. |

## Keyboard

The trigger is a button. Once the list is open, focus stays in the search box and the arrow keys
move the highlight through the options without leaving it.

| Key                | Action                                                                   |
| ------------------ | ------------------------------------------------------------------------ |
| `Enter` / `Space`  | On the trigger: opens the list, with focus in the search box.            |
| `↓` / `↑`          | Highlights the next or previous option, skipping disabled ones.          |
| `Alt` + `↓` / `↑`  | Highlights the first option of the next or previous group.               |
| `Home` / `End`     | Highlights the first or last option.                                     |
| `Ctrl` + `N` / `J` | Same as `↓`.                                                             |
| `Ctrl` + `P` / `K` | Same as `↑`.                                                             |
| `Enter`            | In the search box: picks the highlighted option, or runs the create row. |
| `Escape`           | Closes the list and forgets the search term.                             |

In `type="multiple"`, `Enter` toggles the option and the list stays open.

## Accessibility

The trigger carries `role="combobox"` and `aria-expanded`; the list is a `listbox`; disabled
options carry `aria-disabled` and are skipped by both pointer and keyboard. Selection returns focus
to the trigger, and in `type="multiple"` to the search box, so the keyboard never lands back at the
top of the document and the next Tab continues through the form.

Three things the primitives leave out, which Coral supplies from outside them:

- **The active option is announced.** The search box carries `aria-controls` and
  `aria-activedescendant`, so a screen reader is told which list it drives and which option the
  arrow keys are on. The primitive derives both from an element the shadcn list never renders.
- **An empty list is not left as an empty listbox.** A listbox must own options, so while nothing
  matches, or the results are loading, the message is drawn as an option nothing can pick, inside
  the list, where the arrow keys still have somewhere to be. It is also spoken: typing into a box
  whose list has emptied, or is waiting on a server, otherwise says nothing at all.
- **A disabled option looks disabled.** The shadcn item styles `data-[disabled=true]`, while the
  primitive renders `data-disabled=""`, so the dimming never applied.

## Customizing

`class` lands on the trigger button, `contentClass` on the popover content and `listClass` on the
scrolling list, which is where a max height goes. `align` and `anchor` place the list against
another element than the trigger.

### Custom trigger and options

<Preview demo={customTriggerDemo} />

The `trigger` snippet replaces the button entirely. Spread `props` onto whatever you render and
the popover still wires itself up. The `option` snippet replaces the body of each row, and the
theme's check indicator stays.

Reach for `selection` before `trigger` when only the printed value changes, such as a flag beside a
country's name: the button keeps its role, its `aria-*`, the placeholder and the clear control.
`trigger` hands all of that to you.

Between those two, `footer`, `empty` and `indicator`, every visible part is replaceable without
dropping Coral and rebuilding from raw shadcn.

### Project-wide defaults

The defaults are English because Coral is written in English. A project in another language states
its own once, with [`setCoralDefaults`](/docs/conventions#project-wide-defaults), and every combobox
under it follows; a prop passed at a call site still wins there. Under `'kit/combobox'` it can set
`placeholder`, `searchPlaceholder`, `emptyMessage`, `loadingMessage`, `clearLabel`, `createLabel`
and `searchDebounce`.

### The pieces

The folder keeps its logic in plain modules beside the component: `matching.ts` (the folded match
and the check behind the create row), `remembered.ts` (the labels kept across result sets) and
`selection.ts` (what `selectAll` adds). It is drawn with shadcn's `popover`, `command`, `button` and
`badge`, and reads `lib/options`, `lib/list-status`, `lib/live-region`, `lib/action` and
`lib/hidden-field`.

Dropping to the raw shadcn recipe means writing back the focus return, the folded matching, the
`aria-activedescendant` wiring, the empty and loading rows inside the listbox, the remembered labels
and the form fields.

### Why flat props, for now

The [conventions](/docs/conventions) call for composition when the parts vary independently, and a
combobox eventually does. This version stays flat and hands the varying parts to snippets instead,
because the canonical case (a list, a value, a search box) is the one every caller writes first.

Two decisions keep that from becoming a dead end:

- **The value type is generic from day one.** Widening a closed `string` later would break every
  project that had already worked around it.
- **The popover root's props are forwarded**, so `open` and `onOpenChange` are already the caller's.

What is not here yet is deferred, not designed away. Splitting the trigger, the list and the search
box into separate parts is the extension that stays open, and it can land without moving any of the
props above.

### lib/fold

The search folding lives in `lib/fold.ts` and is exported on its own, so the same comparison can be
used anywhere the same question is asked:

```ts
import { fold } from '#lib/components/coral/lib/fold.js';

fold('Açaí'); // 'acai'
fold('Piña'); // 'pina'
fold('Café'); // 'cafe'
```
