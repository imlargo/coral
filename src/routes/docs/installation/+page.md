---
title: Installation
description: Copy the folder, install the primitives it declares. There is nothing to add to package.json.
---

Coral is not published. You copy it.

## Requirements

A SvelteKit project already initialized with shadcn-svelte — meaning it has a `components.json`,
a `$lib/components/ui/` folder and `$lib/utils.ts` exporting `cn`. Those two paths are the only
things Coral reaches for outside its own folder, and both are guaranteed by any shadcn-svelte
setup. That is what keeps the folder portable.

```bash
pnpm dlx shadcn-svelte@latest init
```

## Copy the folder

```bash
cp -R coral/src/lib/coral your-project/src/lib/coral
```

From here the folder belongs to the project. Editing it is allowed — but a change worth keeping
should come back upstream, or the copies drift apart.

## Install the primitives

Each component declares the shadcn primitives it imports in `src/lib/coral/coral.json`:

```json
{
	"components": {
		"kit/avatar": { "version": "1.0.0", "shadcn": ["avatar"] }
	}
}
```

Install the ones you need:

```bash
pnpm dlx shadcn-svelte@latest add avatar
```

When an entry also lists `npm`, those packages are real dependencies and go in `package.json`.

## Import by file path

There are no barrels. One component, one folder, imported directly:

```svelte
<script lang="ts">
	import Avatar from '$lib/coral/kit/avatar/avatar.svelte';
</script>
```

That makes filenames public API. Renaming one breaks every project that already copied it, so
treat a rename as a breaking change and bump the version in `coral.json`.
