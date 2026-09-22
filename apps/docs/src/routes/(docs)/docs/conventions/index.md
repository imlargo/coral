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
├─ blocks/         → app-level compositions (rule of 3)
└─ lib/            → shared across components
   └─ options.ts   → Option<T>, OptionGroup<T>, and reading either shape
```

**Folders are created when something needs them, never in advance.** `blocks/` does not exist yet
because nothing lives in it. A util with a single consumer stays inside its component's folder and
moves to `lib/` the day a second component needs it, which is exactly how `lib/options.ts` came to
be, when `select` became the second component to speak `Option<T>`.

Moving a file is a breaking change: filenames are public API, so the component that gave the util up
gets a major bump. `combobox` went to `3.0.0` for that reason and for no other. Its props did not
change.

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
 * @version 1.2.0
 */
```

```json
{
	"components": {
		"kit/combobox": {
			"title": "Combobox",
			"description": "A select with a search box, filtering the way accented text is actually typed.",
			"version": "1.2.0",
			"shadcn": ["popover", "command"],
			"npm": ["cmdk"]
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
apps/docs/src/routes/docs/kit/avatar/
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
