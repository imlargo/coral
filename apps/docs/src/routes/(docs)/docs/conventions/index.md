---
title: Conventions
description: The rules every Coral component follows, and the reason each one exists.
---

## Folder layout

```
src/lib/components/coral/     ← beside shadcn's ui/
├─ coral.json      → manifest: title, description, version + required primitives
├─ kit/            → composed, generic components - the product
│  └─ avatar/
│     ├─ avatar.svelte
│     ├─ types.ts
│     └─ initials.ts
├─ blocks/         → compositions of the above, one per use case
│  └─ table-panel/
└─ lib/            → shared across components
   ├─ options.ts   → Option<T>, OptionGroup<T>, and reading either shape
   ├─ intl.ts      → collators and formatters, built once
   └─ trigger.ts   → the id and aria-* a button trigger takes
```

**Folders are created when something needs them, never in advance.** A util with a single consumer
stays inside its component's folder and moves to `lib/` the day a second component needs it, which
is exactly how `lib/options.ts` came to be, when `select` became the second component to speak
`Option<T>`.

Moving a file is a breaking change: filenames are public API, so the component that gave the util
up gets a major bump, even though its props did not change.

## What a block is

`kit/` resolves the behaviour of one control. `blocks/` resolves the wiring _between_ several of
them, for one use case: the pipeline a list screen runs, the order things happen in, which state is
shared. A block that only arranges components on a page is a layout, and layouts are yours.

Five rules, so the layer stays a library rather than a folder of templates:

1. **It composes two or more `kit/` components** and earns its keep on what it wires, not on what it
   arranges.
2. **Still no appearance, still no entities.** A block is shaped by a use case, not by a domain:
   "a table with the screen around it", never "an invoices table".
3. **It takes data and callbacks.** No fetching, no routing, no knowledge of your data layer. Where
   a block needs to reach outside itself, it takes a snippet or a handler - `table-panel` takes its
   rows and hands back what was selected.
4. **It may carry copy, with English defaults.** A block has more to say than a control does, and a
   skeleton that has to be filled in entirely is not worth installing. Every string is a prop.
5. **Rule of three.** A component enters `kit/` after the same pattern has been written twice; a
   block waits for three, because the wiring is what varies most between projects.

Blocks are published like anything else: `blocks/<name>/`, an entry in `coral.json`, a page under
`docs/blocks/`, and a registry item named `blocks-<name>` that pulls in the `kit/` items it
composes.

## Props

Every component accepts and merges a `class` prop, so overrides never require a wrapper element:

```svelte
<script lang="ts">
	import { cn } from '$lib/utils.js';

	let { class: className, ...restProps } = $props();
</script>

<div class={cn('flex items-center gap-2', className)} {...restProps}></div>
```

**Never remove capability the wrapped primitive already had.** Forward its props with
`ComponentProps<typeof X>` and keep whatever it exposes for binding: `ref`, `loadingStatus`, and
friends. Derive types from the shadcn component, never from `bits-ui` directly:

```ts
import type { ComponentProps } from 'svelte';
import type { Avatar } from '$lib/components/ui/avatar/index.js';

type RootProps = ComponentProps<typeof Avatar>;
```

Selectable components support two-way binding. Shared state in composed components flows through
Svelte context, never hand-wired props.

## What every component agrees on

The same situation is handled the same way everywhere, so a component you have not used yet behaves
like the ones you have.

**A handler that can fail.** Anything that waits on your function - a save, a confirm, a step - goes
through `lib/action`. Return exactly `false`, or throw, and the component stays where it is: the
dialog open, the field editing, the stepper on its step. Anything else, including nothing, counts as
done, so an existing handler can be passed straight in. `onerror` receives what was thrown; without
it the error propagates as an unhandled rejection, visible in the console and to nobody using the
page. Where `error` is already a prop, as on `page-state`, it is `onretryerror`.

**A trigger that is a button.** `select`, `combobox` and `date-picker` take `id`, `aria-label`,
`aria-labelledby`, `aria-describedby` and `aria-invalid` and put them on the trigger, because that is
the element a reader focuses and a screen reader names. That is where a `<Label for>` points, and
where the props a form library's control hands out belong. An `aria-label` written over a label that
already names the control replaces it silently, so a component only supplies one of its own when
nothing else does.

**Words.** Every string a reader sees or hears is a prop with an English default. A `*Message` is a
single plain line; a `*Title` and `*Description` are a heading and the line beneath it. Callbacks
that report a change to a root that is an element are named `on<thing>change`, because a `<div>` has
an `onchange` of its own and the two would merge into a handler nobody can satisfy.

**Being the reader's first Escape.** A field that has something to undo - a search term, a rename,
a number being typed - takes the first Escape and stops it there. With nothing to undo, it lets the
key through, so a dialog around it still closes.

**Closing.** Whatever has to happen when a popover closes, such as forgetting the search term, goes
through `lib/on-close`. The primitive reports the closes it made itself - Escape, a click outside, a
pick - and says nothing when your code assigns `open`, which is what a `close()` in a footer does.

**Appearance.** No literal colours, shadows, radii or type sizes. State that no shadcn primitive
draws - a focus ring, a drag target, the section being read - uses the theme's own tokens and scale
(`border-ring`, `bg-accent`, `rounded-sm`), which change with whatever theme the project installed.
Where a primitive already draws the thing, Coral uses it.

**Tests.** Behaviour is tested in a real browser, next to the component. Every component is also run
through axe in `a11y.svelte.test.ts`, in its default state and in each state that changes its
markup.

## Types

Generic, never closed:

```ts
// $lib/components/coral/lib/options.js
export type Option<T = string> = {
	value: T;
	label: string;
	disabled?: boolean;
	description?: string;
	keywords?: string[];
};
```

A `value: string` shape looks harmless until the first project selects by id, by object, or by
enum, and then the component has to be rewritten.

One vocabulary, not one per component: `select` and `combobox` both read `Option<T>`, so a list
moves between them without being rewritten. A component ignores the fields it has no use for: a
select does not search, so it never reads `keywords`.

## Version headers

Every file carries a header, matched to an entry in `coral.json`:

```ts
/**
 * @coral/kit/combobox
 * @version 1.0.0
 */
```

```json
{
	"components": {
		"kit/combobox": {
			"title": "Combobox",
			"description": "A select with a search box, filtering the way accented text is actually typed.",
			"version": "1.0.0",
			"shadcn": ["popover", "command", "button", "badge", "spinner"],
			"npm": ["@lucide/svelte"]
		}
	}
}
```

That entry is the source everything else is derived from: the registry item the CLI installs, the
primitives it pulls in with it, the version it reports. Declare every primitive the component
imports; omit `npm` when there are none. `title` and `description` also have to match the
component's docs page, and a test says so.

## Formatting

Tabs, single quotes, no trailing commas, 100 columns: enforced by Prettier. Tailwind classes are
auto-sorted; do not hand-order them.

## Documenting a component

Docs live next to nothing in Coral itself: the site is a separate workspace, and the folder that
gets installed stays clean. A page is one Markdown file plus its demos:

```
apps/docs/src/routes/(docs)/docs/kit/avatar/
├─ index.md
└─ demos/
   ├─ basic.svelte
   └─ sizes.svelte
```

Render a demo with its name, the path minus `demos/` and the extension:

```svelte
<Preview name="kit/avatar/basic" />
```

The Code tab shows that file's actual source, read at build time. There is no second copy of the
snippet to keep in sync, and a demo that does not exist fails the build instead of rendering an
empty box.

The sidebar and the install command come for free: `kit/*` pages are collected from the folder
itself, and each one prints the `shadcn-svelte add` line for its registry item. Neither is a list
to update.
