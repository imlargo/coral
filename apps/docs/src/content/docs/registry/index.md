---
title: Registry
description: How Coral is published as a shadcn-svelte registry - item names, the index, versions, and what an item brings with it.
group: Concepts
---

Coral is published as a [shadcn-svelte registry](https://shadcn-svelte.com/docs/registry): a set of
JSON files served by this site under `/r/`, which the shadcn-svelte CLI knows how to install.
Nothing about it is specific to Coral beyond the names.

## Items

Every component and every shared module is an item, named after its manifest entry with each slash
swapped for a dash:

| Manifest name   | Item           | URL                                             |
| --------------- | -------------- | ----------------------------------------------- |
| `kit/combobox`  | `kit-combobox` | `https://coral.imlargo.dev/r/kit-combobox.json` |
| `lib/options`   | `lib-options`  | `https://coral.imlargo.dev/r/lib-options.json`  |
| every component | `coral`        | `https://coral.imlargo.dev/r/coral.json`        |

The layer stays in the name on purpose. The CLI merges an install's dependency tree by item name,
so an item called `select` would be taken for shadcn-svelte's own `select`, and one of the two would
be dropped, files and all.

You install `kit-*` items. `lib-*` items arrive as their dependencies; there is no reason to add
one by hand.

## The index

[`/r/index.json`](https://coral.imlargo.dev/r/index.json) lists every item the registry serves, with
its title, description, dependencies and `meta.version`. It is what to read to script against Coral, or to check
what exists without opening the docs.

## What an item brings

A component's item declares:

- **`registryDependencies`**: the shadcn-svelte primitives it imports, by their shadcn names
  (`popover`, `command`), and the Coral items it reaches, as URLs relative to its own
  (`./lib-fold.json`). The CLI installs both, transitively.
- **`dependencies`**: the npm packages it imports, with versions. Nobody writes these by hand: the
  registry build reads each file's imports. In practice that is `@lucide/svelte` for icons, mapped to
  your `iconLibrary` on install, and `libphonenumber-js` for the phone input.
- **`files`**: the component's own files, each as `registry:component` with a `target` under
  `coral/`. The CLI resolves that type against your `components` alias, which is why Coral lands
  beside `ui/` and follows the alias if you moved it.
- **`meta.version`**: the component's current version, the same as in its file headers.

## Imports on the way in

Coral's source imports primitives as `#lib/components/ui/*` and `cn` as `#lib/utils.js`. The build
turns those into placeholders, and the CLI writes your aliases in their place, so the installed
files import the way the rest of your project does. Imports between Coral's own files are relative
and left as they are, which is what keeps the folder working wherever it lands.

Tests are not published. They are written against this repository's browser test setup and would
only tie your project to it.

## Using Coral from your own registry

A registry can depend on another registry's items by URL. To ship a component of your own that
builds on Coral, list the Coral item's full URL in its `registryDependencies`:

```json
{
	"name": "deploy-target-picker",
	"type": "registry:component",
	"registryDependencies": ["https://coral.imlargo.dev/r/kit-combobox.json"],
	"files": [
		{
			"path": "src/lib/components/deploy-target-picker.svelte",
			"type": "registry:component"
		}
	]
}
```

Installing your item then brings the combobox, its primitives and its shared modules with it.

## How it is built

There is no hand-written `registry.json`. The repository derives it from
[`coral.json`](https://github.com/imlargo/coral/blob/main/packages/coral/src/lib/components/coral/coral.json)
and the folder itself, then runs `shadcn-svelte registry build`. CI installs every item into a
throwaway SvelteKit project and type-checks the result on every change, so an item that installs
broken fails before it is published.
