---
title: Command palette
description: ⌘K over your own actions - with recents, per-action shortcuts, and a run that can fail.
group: Kit
category: Actions and overlays
---

<script lang="ts">
	import Preview from '#lib/features/docs/components/Preview.svelte';
	import basicDemo from './demos/basic.svelte?demo';
	import asyncDemo from './demos/async.svelte?demo';
</script>

shadcn's `command` gives the list, the filtering and the arrow keys. What every project then writes
by hand is the rest of the palette: the global shortcut that opens it, an `open` flag, the actions
in groups, what happens while an action is in flight, and the recents that make the second use
faster than the first. The search box at the top of this site is that hand-written version.

- **The shortcut, both ways:** one combo opens and closes it, in [`kit/shortcut`](/docs/kit/shortcut)
  syntax, so `mod+k` is Command on a Mac and Control elsewhere.
- **Actions carry their own shortcut.** Drawn beside the action, and bound for as long as the palette
  is mounted, so the combo is true everywhere and not only inside the list.
- **Recents, lifted not reordered:** recently run actions move into a group at the top; everything
  else stays exactly where it was, because a list that re-sorts itself defeats the muscle memory a
  palette exists for. `recent` is bindable: where it is stored is the project's to decide.
- **Running can fail.** `run` may be async: the row reports that it is working, and returning `false`
  or throwing keeps the palette open, which is where the error can still be read.
- **Search by things you do not show.** `keywords` are matched but never rendered.

<Preview demo={basicDemo} class="min-h-64" />

## When to use

**Use it when**

- The app has more actions than its menus can show, and readers should reach them by name.
- Actions deserve keyboard shortcuts that work anywhere on the page, drawn where they are listed.
- Search mixes local actions with results from a server, like repositories or team members.

**Reach for something else when**

- The reader picks a value for a form field: use [Combobox](/docs/kit/combobox), or
  [Select](/docs/kit/select) for a short list.
- The list filters a page in place rather than running something: use
  [Search input](/docs/kit/search-input).
- There are a handful of actions tied to one row or one object: shadcn's `DropdownMenu` keeps them
  next to what they act on.

## Usage

Composes [`kit/shortcut`](/docs/kit/shortcut), which the install brings with it.

```svelte
<script lang="ts">
	import CommandPalette from '#lib/components/coral/kit/command-palette/command-palette.svelte';
</script>
```

```svelte
<CommandPalette
	bind:recent
	actions={[
		{ id: 'new-project', label: 'New project', group: 'Create', run: () => goto('/new') },
		{ id: 'invite', label: 'Invite a teammate', group: 'Team', run: () => (inviting = true) }
	]}
/>
```

## Examples

### Waiting, and failing

<Preview demo={asyncDemo} class="min-h-64" />

The same rule as [confirm dialog](/docs/kit/confirm-dialog) and
[action button](/docs/kit/action-button): return `false`, or throw, to stay put. An action is
remembered as recent whether or not it succeeded: the reader reached for it, which is what the list
is a record of.

While an action runs, a spinner takes the place of its shortcut, and no other action can start until
it settles. What it throws goes to `onerror`, with the action that threw it; without `onerror` it is
an unhandled rejection.

### Server-side search

Pass `onsearch` and the primitive's own filtering is switched off, because the list becomes the
server's answer and filtering it again locally would hide rows it meant to return. Debounce it with
`searchDebounce`, and set `loading` while the request is out.

`loading` adds a loading row under the actions already listed, and announces `loadingMessage`. The
actions stay where they were and stay runnable: a palette that mixes local actions (go to settings,
toggle the theme) with remote results (search repositories) never blanks the local ones while the
server is thinking, and the list does not flicker on every keystroke.

For that mixed palette, set `shouldFilter` back on. The local actions are then narrowed by the term
like any other row, and the remote results pass through because the server already matched them.

When the palette finishes closing, the term is cleared, and `onsearch` is called once with `''` if
the term was not already empty.

### Nothing matches

When the term matches no action and nothing is loading, the list shows `emptyMessage` in a row
nothing can select, and announces it. The `empty` snippet replaces what that row draws.

### Disabled actions

A disabled action stays listed, dimmed, and cannot be run from the list or through its shortcut.

## Props

Everything the shadcn command dialog accepts stays available: `title`, `description`, `portalProps`.
On top of that:

| Prop                           | Type                              | Default                       | Description                                       |
| ------------------------------ | --------------------------------- | ----------------------------- | ------------------------------------------------- |
| `actions`                      | `CommandAction[]`                 | -                             | Everything the palette can do. Required.          |
| `open`                         | `boolean`                         | `false`                       | Bindable.                                         |
| `shortcut`                     | `string`                          | `mod+k`                       | Opens and closes it. `''` binds nothing.          |
| `bindActionShortcuts`          | `boolean`                         | `true`                        | Binds each action's own shortcut.                 |
| `recent`                       | `string[]`                        | `[]`                          | Bindable. Ids, most recent first.                 |
| `maxRecent`                    | `number`                          | `5`                           | How many are lifted to the top.                   |
| `recentLabel`                  | `string`                          | `Recent`                      | Heading for the lifted group.                     |
| `search`                       | `string`                          | `''`                          | Bindable.                                         |
| `onsearch`                     | `(term: string) => void`          | -                             | Server-side search. Switches off local filtering. |
| `searchDebounce`               | `number`                          | `0`                           | Milliseconds of quiet typing before `onsearch`.   |
| `shouldFilter`                 | `boolean`                         | unless `onsearch` is set      | The primitive's own filtering by the term.        |
| `loading`                      | `boolean`                         | `false`                       | A loading row under the actions already listed.   |
| `onrun`                        | `(action: CommandAction) => void` | -                             | An action ran and did not refuse.                 |
| `onerror`                      | `(error, action) => void`         | -                             | Receives what an action threw.                    |
| `vimBindings`                  | `boolean`                         | unless a combo clashes        | The primitive's Ctrl+N/P/J/K navigation.          |
| `placeholder`                  | `string`                          | `Type a command or search...` | Shown in the search box.                          |
| `emptyMessage`                 | `string`                          | `No results found.`           | Shown, and announced, when nothing matches.       |
| `loadingMessage`               | `string`                          | `Loading...`                  | Shown, and announced, while `loading`.            |
| `class`, `listClass`           | `string`                          | -                             | Merged onto the dialog, and onto the list.        |
| `trigger`                      | `Snippet<[{ props, open }]>`      | -                             | The element that opens it.                        |
| `action`                       | `Snippet<[{ action, pending }]>`  | -                             | Replaces each row's body.                         |
| `indicator`, `empty`, `footer` | `Snippet`                         | -                             | Loading row contents, empty row contents, footer. |

### Actions

```ts
type CommandAction = {
	id: string; // stable: it is what `recent` remembers
	label: string;
	description?: string;
	keywords?: string[]; // matched, never shown
	group?: string; // heading to file it under
	shortcut?: string; // drawn, and bound while mounted
	disabled?: boolean; // stays listed, because hiding it reads as "it does not exist"
	run: () => unknown; // async-aware; `false` or throw keeps the palette open
};
```

## Keyboard

The palette's own shortcut and each action's shortcut work anywhere on the page while the palette
is mounted. The rest apply while the search box has focus.

| Key                                       | Action                                                                   |
| ----------------------------------------- | ------------------------------------------------------------------------ |
| `mod` + `K` (or `shortcut`)               | Opens the palette, or closes it when open.                               |
| An action's `shortcut`                    | Runs that action, open or not. Off with `bindActionShortcuts={false}`.   |
| `↑` / `↓`                                 | Highlights the previous or next action.                                  |
| `Alt` + `↑` / `↓`                         | Jumps to the previous or next group.                                     |
| `Home` / `End`                            | Highlights the first or last action.                                     |
| `Ctrl` + `N` or `J` / `Ctrl` + `P` or `K` | Next or previous action, while `vimBindings` is on.                      |
| `Enter`                                   | Runs the highlighted action. Ignored while an input method is composing. |
| `Escape`                                  | Closes the palette.                                                      |

### One thing to know about `mod+k`

Off a Mac, `mod+k` is `Ctrl+K`, and the command primitive reads Ctrl+K as "previous item" in its vim
bindings, cancelling the key. A palette bound that way opens and then refuses to close on the same
combo, on every machine that is not a Mac.

So when a combo the palette binds would be swallowed, those bindings give way to it. Set
`vimBindings` to force the question either way.

## Accessibility

- **From the primitive.** The dialog, the combobox semantics, the arrow keys and the focus trap are
  the primitive's, including the visually hidden title and description every dialog needs.
- **The trigger.** What is added here is the trigger's `aria-haspopup`, `aria-expanded` and
  `aria-keyshortcuts`, and shortcut glyphs that are read out by name rather than as "place of
  interest sign." See [shortcut](/docs/kit/shortcut).
- **The highlighted action.** The search box also carries `aria-controls` and
  `aria-activedescendant`, which the primitive cannot derive here, so the highlighted action is
  announced.
- **Empty and loading.** A list with nothing to run says so inside itself, as an option nothing can
  pick - a listbox may own nothing else - and the words are spoken too, whether the results are
  loading or the term matched nothing.
- **Disabled actions.** A disabled action is dimmed, and it stays in the list. Hiding it is how a
  reader concludes the feature does not exist, rather than that they cannot use it right now.

## Customizing

- **`class`** is merged onto the dialog and **`listClass`** onto the list.
- **Snippets:** `trigger` renders what opens the palette (spread `props` onto it), `action` replaces
  the body of each row and receives `pending` for the one that is running, `indicator` and `empty`
  replace the loading and empty rows, and `footer` renders below the list, inside the dialog.
- **Project-wide defaults.** `placeholder`, `emptyMessage`, `loadingMessage`, `recentLabel` and
  `searchDebounce` can be stated once with
  [`setCoralDefaults`](/docs/conventions#project-wide-defaults) under `'kit/command-palette'`; a
  prop at the call site still wins.

### The pieces

Dropping down to shadcn's `CommandDialog` means writing back the global shortcut, the per-action
bindings, the recents, the busy row and the close that waits for `run`, plus the
`aria-activedescendant` wiring and the announced empty and loading rows. Most of that is reachable
on its own: the shortcut parsing and listening come from [`kit/shortcut`](/docs/kit/shortcut), the
wait from `lib/action.svelte.ts`, and the ordering from `actions.ts` below.

### actions.ts

`group`, `remember` and `searchValue` are pure and exported, so the same ordering can drive a
different surface (a menu, a toolbar, a mobile sheet):

```ts
import { group, remember } from '#lib/components/coral/kit/command-palette/actions.js';

group(actions, { recent: ['settings'], maxRecent: 3 });
remember(['a', 'b'], 'b'); // ['b', 'a'] - moved, not duplicated
```
