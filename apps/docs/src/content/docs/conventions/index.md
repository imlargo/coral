---
title: Conventions
description: The rules every Coral component follows, and the reason each one exists.
group: Concepts
---

Every component follows the same rules, so one you have not used yet behaves like the ones you
have. Where the folders are and how the layers depend on each other is on
[Architecture](/docs/architecture).

## Props

Every component accepts and merges a `class` prop, so overrides never require a wrapper element:

```svelte
<script lang="ts">
	import { cn } from '#lib/utils.js';

	let { class: className, ...restProps } = $props();
</script>

<div class={cn('flex items-center gap-2', className)} {...restProps}></div>
```

**Never remove capability the wrapped primitive already had.** Forward its props with
`ComponentProps<typeof X>` and keep whatever it exposes for binding: `ref`, `loadingStatus`, and
friends. Derive types from the shadcn component, never from `bits-ui` directly:

```ts
import type { ComponentProps } from 'svelte';
import type { Avatar } from '#lib/components/ui/avatar/index.js';

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
page. Where `error` is already a prop, it is `onretryerror`.

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

**Locale.** A `locale` prop defaults to `en-US`, never to the reader's own, so the server and the
browser render the same text. A project states its locale once, below, and every component follows.

**Being the reader's first Escape.** A field that has something to undo - a search term, a rename,
a number being typed - takes the first Escape and stops it there. With nothing to undo, it lets the
key through, so a dialog around it still closes.

**Closing.** Whatever has to happen when a popover closes, such as forgetting the search term, goes
in the primitive's `onOpenChangeComplete`, chained after the caller's own. `onOpenChange` reports
only the closes the primitive made itself - Escape, a click outside, a pick - and says nothing when
your code assigns `open`, which is what a `close()` in a footer does. `onOpenChangeComplete` hears
every close, once the exit animation is over: reset a list any sooner and it refills while it is
still fading out.

**Appearance.** No literal colours, shadows, radii or type sizes. State that no shadcn primitive
draws - a focus ring, a drag target, the section being read - uses the theme's own tokens and scale
(`border-ring`, `bg-accent`, `rounded-sm`), which change with whatever theme the project installed.
Where a primitive already draws the thing, Coral uses it.

**Tests.** Behaviour is tested in a real browser, next to the component. Every component is also run
through axe in `a11y.svelte.test.ts`, in its default state and in each state that changes its
markup.

## Project-wide defaults

A product whose UI is not in English would otherwise pass the same `placeholder`, `cancelLabel` and
`locale` at every call site, and one forgotten prop leaves English in the middle of a translated
screen. `lib/defaults` is where a project says it once:

```svelte
<!-- +layout.svelte, or App.svelte -->
<script lang="ts">
	import { setCoralDefaults } from '#lib/components/coral/lib/defaults.js';

	setCoralDefaults({
		locale: 'es-CO',
		'kit/select': { placeholder: 'Selecciona una opción...' },
		'kit/combobox': { placeholder: 'Selecciona una opción...', emptyMessage: 'Sin resultados.' },
		'kit/confirm-dialog': { cancelLabel: 'Cancelar', confirmLabel: 'Continuar' },
		'kit/relative-time': { cutoff: 30 * 24 * 60 * 60 * 1000 }
	});
</script>
```

Three rules keep it predictable:

- **Keyed by component, typed by what is installed.** Each component declares which of its props
  can be set this way - its copy, its `locale`, and the values that are project policy rather than
  per-field choices, such as `relative-time`'s `cutoff` or `date-picker`'s `format` - and adds that
  entry to `CoralDefaults` from its own `types.ts`. A prop that is not on the component cannot be
  set as a default for it, and a component that is not installed has no entry.
- **A call site still wins.** A prop passed to one component applies to that one, whatever the
  project stated. The defaults only fill what was left out.
- **Read when a component is created.** It goes through Svelte context, so it can be set again for
  one subtree - a section in another language - and it is not re-read on the fly. A language
  switch keys the subtree on the locale, which re-creates the components, and is what such a
  switch does anyway.

`setCoralDefaults` is a plain function that has to run during a component's initialization, which
is where a root layout's script runs. The English defaults stay in the source, so a component
rendered outside any `setCoralDefaults` reads exactly as it did before.

## Types

Generic, never closed:

```ts
// #lib/components/coral/lib/options.js
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
apps/docs/src/content/docs/kit/avatar/
├─ index.md
└─ demos/
   ├─ basic.svelte
   └─ sizes.svelte
```

Import a demo with `?demo` and hand it to `Preview`:

```svelte
<script lang="ts">
	import Preview from '#lib/features/docs/components/Preview.svelte';
	import basicDemo from './demos/basic.svelte?demo';
</script>

<Preview demo={basicDemo} />
```

The Code tab shows that file's actual source, read at build time. There is no second copy of the
snippet to keep in sync, a demo that does not exist fails the build instead of rendering an empty
box, and a page only loads the demos it imports.

The sidebar and the install command come for free: the pages of every layer - `kit/`, `blocks/`,
`product/` - are collected from the folder itself and listed under the `group` in their
frontmatter, and each one prints the `shadcn-svelte add` line for its registry item. Neither is a
list to update.

The Props tables are the one part written by hand, so a test holds them to the source: every prop
the component's `types.ts` declares needs a row, every row has to be a prop it takes, and
"Bindable" goes on exactly the props that are. A new prop without a row fails the suite.
