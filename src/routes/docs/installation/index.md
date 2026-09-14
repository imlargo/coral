---
title: Installation
description: Copy the folder, install the primitives it declares. There is nothing to add to package.json.
---

Coral is not an npm package. You copy it, and from that moment it is yours.

## Requirements

A SvelteKit project already initialized with shadcn-svelte - meaning it has a `components.json`,
a `$lib/components/ui/` folder and `$lib/utils.ts` exporting `cn`. Those two paths plus
`@lucide/svelte` are the only things Coral reaches for outside its own folder, and all three are
guaranteed by any shadcn-svelte setup: the paths by the aliases in `components.json`, the icons by
its `iconLibrary`. That is what keeps the folder portable.

```bash
pnpm dlx shadcn-svelte@latest init
```

## Copy the folder

```bash
npx degit imlargo/coral/src/lib/coral src/lib/coral
```

Take the whole folder, or just the `kit/` directories you want plus `lib/` - each component folder
is self-contained apart from what `lib/` holds.

From here the folder belongs to the project. Editing it is allowed - but a change worth keeping
should come back upstream, or the copies drift apart.

> **Coming: one-command install.** shadcn-svelte can add components straight from a custom
> registry, which is the right shape for Coral - still copied, still yours, but with the primitives
> resolved for you. `pnpm dlx shadcn-svelte@latest add https://coral.imlargo.dev/r/combobox.json`
> is the next milestone; until then, the steps on this page are the install.

## Install the primitives

Each component declares the shadcn primitives it imports in `src/lib/coral/coral.json`:

```json
{
	"components": {
		"kit/avatar": { "version": "1.1.0", "shadcn": ["avatar"] },
		"kit/select": { "version": "2.1.0", "shadcn": ["select", "button"], "npm": ["@lucide/svelte"] }
	}
}
```

Install the ones you need:

```bash
pnpm dlx shadcn-svelte@latest add avatar
```

Only what a component **imports** is listed. Primitives those primitives need in turn are the
CLI's job - adding `input-group` brings its own `button`, `input` and `textarea` with it.

When an entry also lists `npm`, those packages are real dependencies and go in `package.json`.
`@lucide/svelte` is already there in any project whose `components.json` sets
`"iconLibrary": "lucide"`, which is the default.

Entries under `lib/` are shared by several components rather than being components themselves:
`lib/options` is the `Option<T>` vocabulary, `lib/hidden-field` the field that lets a select,
combobox or date picker take part in a form. They come with the folder - there is nothing to
install for them.

## Import by file path

There are no barrels. One component, one folder, imported directly:

```svelte
<script lang="ts">
	import Avatar from '$lib/coral/kit/avatar/avatar.svelte';
</script>
```

That makes filenames public API. Renaming one breaks every project that already copied it, so
treat a rename as a breaking change and bump the version in `coral.json`.

## Versioning

Each component carries its own version in `coral.json` and follows semver, so a breaking change to
one is visible without reading a diff. There is no single Coral version to track - you copied a
folder, and what matters is which components in it are behind.
