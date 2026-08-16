---
title: Conventions
description: The rules every Coral component follows, and the reason each one exists.
---

## Folder layout

```
src/lib/coral/
├─ coral.json      → manifest: version + required primitives per component
├─ kit/            → composed, generic components - the product
│  └─ avatar/
│     ├─ avatar.svelte
│     ├─ types.ts
│     └─ initials.ts
├─ blocks/         → app-level compositions (rule of 3)
└─ lib/            → shared utils, formatters, types
```

**Folders are created when something needs them, never in advance.** `blocks/` and `lib/` do not
exist yet because nothing lives in them. A util with a single consumer stays inside its
component's folder and moves to `lib/` the day a second component needs it.

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
`ComponentProps<typeof X>` and keep whatever it exposes for binding - `ref`, `loadingStatus`, and
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
export type Option<T = string> = {
	value: T;
	label: string;
	disabled?: boolean;
};
```

A `value: string` shape looks harmless until the first project selects by id, by object, or by
enum - and then the component has to be rewritten.

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
			"version": "1.2.0",
			"shadcn": ["popover", "command"],
			"npm": ["cmdk"]
		}
	}
}
```

`shadcn` and `npm` are what make installing Coral "copy the folder, then install these" - declare
every primitive the component imports. Omit `npm` when there are none.

## Formatting

Tabs, single quotes, no trailing commas, 100 columns - enforced by Prettier. Tailwind classes are
auto-sorted; do not hand-order them.

## Documenting a component

Docs live next to nothing in Coral itself - this site is a separate app, and the folder that gets
copied stays clean. A page is one Markdown file plus its demos:

```
src/routes/docs/kit/avatar/
├─ +page.md
└─ demos/
   ├─ basic.svelte
   └─ sizes.svelte
```

Render a demo with its name - the path minus `demos/` and the extension:

```svelte
<Preview name="kit/avatar/basic" />
```

The Code tab shows that file's actual source, read at build time. There is no second copy of the
snippet to keep in sync, and a demo that does not exist fails the build instead of rendering an
empty box. Add the page to the sidebar in `src/lib/docs/nav.ts`.
