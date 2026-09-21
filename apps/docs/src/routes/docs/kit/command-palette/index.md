---
title: Command palette
description: ⌘K over your own actions - with recents, per-action shortcuts, and a run that can fail.
---

<script lang="ts">
	import Preview from '$docs/preview.svelte';
</script>

shadcn's `command` gives the list, the filtering and the arrow keys. What every project then writes
by hand is the rest of the palette: the global shortcut that opens it, an `open` flag, the actions
in groups, what happens while an action is in flight, and the recents that make the second use
faster than the first. The search box at the top of this site is that hand-written version.

<Preview name="kit/command-palette/basic" class="min-h-64" />

## What Coral adds

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

## Waiting, and failing

<Preview name="kit/command-palette/async" class="min-h-64" />

The same rule as [confirm dialog](/docs/kit/confirm-dialog) and
[action button](/docs/kit/action-button): return `false`, or throw, to stay put. An action is
remembered as recent whether or not it succeeded: the reader reached for it, which is what the list
is a record of.

## Server-side search

Pass `onsearch` and the primitive's own filtering is switched off, because the list becomes the
server's answer and filtering it again locally would hide rows it meant to return. Debounce it with
`searchDebounce`, and show `loading` while the request is out.

## One thing to know about `mod+k`

Off a Mac, `mod+k` is `Ctrl+K`, and the command primitive reads Ctrl+K as "previous item" in its vim
bindings, cancelling the key. A palette bound that way opens and then refuses to close on the same
combo, on every machine that is not a Mac.

So when a combo the palette binds would be swallowed, those bindings give way to it. Set
`vimBindings` to force the question either way.

## Import

Composes [`kit/shortcut`](/docs/kit/shortcut), which the install brings with it.

```svelte
<script lang="ts">
	import CommandPalette from '$lib/components/coral/kit/command-palette/command-palette.svelte';
</script>
```

## Actions

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
| `loading`                      | `boolean`                         | `false`                       | A loading row in place of the list.               |
| `onrun`                        | `(action: CommandAction) => void` | -                             | An action ran and did not refuse.                 |
| `onerror`                      | `(error, action) => void`         | -                             | Receives what an action threw.                    |
| `vimBindings`                  | `boolean`                         | unless a combo clashes        | The primitive's Ctrl+N/P/J/K navigation.          |
| `placeholder`                  | `string`                          | `Type a command or search...` | Shown in the search box.                          |
| `emptyMessage`                 | `string`                          | `No results found.`           | Shown when nothing matches.                       |
| `trigger`                      | `Snippet<[{ props, open }]>`      | -                             | The element that opens it.                        |
| `action`                       | `Snippet<[{ action, pending }]>`  | -                             | Replaces each row's body.                         |
| `indicator`, `empty`, `footer` | `Snippet`                         | -                             | Loading row, empty state, footer.                 |

## Accessibility

The dialog, the combobox semantics, the arrow keys and the focus trap are the primitive's, including
the visually hidden title and description every dialog needs. What is added here is the trigger's
`aria-haspopup`, `aria-expanded` and `aria-keyshortcuts`, and shortcut glyphs that are read out by
name rather than as "place of interest sign." See [shortcut](/docs/kit/shortcut).

A disabled action stays in the list. Hiding it is how a reader concludes the feature does not exist,
rather than that they cannot use it right now.

## actions.ts

`group`, `remember` and `searchValue` are pure and exported, so the same ordering can drive a
different surface (a menu, a toolbar, a mobile sheet):

```ts
import { group, remember } from '$lib/components/coral/kit/command-palette/actions.js';

group(actions, { recent: ['settings'], maxRecent: 3 });
remember(['a', 'b'], 'b'); // ['b', 'a'] - moved, not duplicated
```
