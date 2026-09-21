---
title: Installation
description: One command per component. It lands in your project as source you own, with its primitives already resolved.
---

Coral is not an npm package. Every component is installed as source, straight into your
`src/lib/components/coral/` - next to the `ui/` folder shadcn keeps there - and from that moment it
is yours.

What does the installing is the shadcn-svelte CLI you already have, pointed at Coral's registry.

## Requirements

A SvelteKit project already initialized with shadcn-svelte, meaning it has a `components.json`,
a `$lib/components/ui/` folder and `$lib/utils.ts` exporting `cn`:

```bash
pnpm dlx shadcn-svelte@latest init
```

Those two paths are the only things Coral reaches for outside its own folder, and both are
guaranteed by that setup - as are the icons, which come from whatever `iconLibrary` your
`components.json` names.

## Add a component

```bash
pnpm dlx shadcn-svelte@latest add https://coral.imlargo.dev/r/kit-select.json
```

Every component page carries its own command, for the package manager you use.

That one line does four things that the copy-the-folder install left to you:

- **Installs the shadcn primitives the component imports.** `kit-select` pulls in `select` and
  `button` from shadcn-svelte, in your style, and those pull in whatever they need in turn.
- **Installs the shared modules it depends on.** `lib/options` is the `Option<T>` vocabulary,
  `lib/hidden-field` the input that lets a select take part in a form; you never ask for them by
  name.
- **Rewrites the imports to your aliases.** Coral is written against `$lib/components/ui/*` and
  `$lib/utils.js`; what lands in your project is written against whatever your `components.json`
  says instead.
- **Maps the icons to your icon library.** A project on `@tabler/icons-svelte` gets Tabler icons,
  not a broken import - which is exactly the failure the copied folder used to hand you.

## Where it lands

Under your `components` alias, beside shadcn's `ui/`, in the shape the repo keeps it in:

```
src/lib/components/
├─ ui/                        ← shadcn-svelte
└─ coral/                     ← Coral
   ├─ kit/select/select.svelte
   ├─ kit/select/types.ts
   └─ lib/options.ts
```

If your `components.json` points `components` somewhere else, Coral follows it there. Components
import each other by relative path, so the folder keeps working wherever that alias points. Tests
are not published: they are written against this repo's test setup, and a copy of them in your
project would only pin you to it.

From here the folder belongs to the project. Editing it is allowed, but a change worth keeping
should come back upstream, or the copies drift apart.

## Import by file path

There are no barrels. One component, one folder, imported directly:

```svelte
<script lang="ts">
	import Select from '$lib/components/coral/kit/select/select.svelte';
</script>
```

That makes filenames public API. Renaming one breaks every project that already installed it, so a
rename is a breaking change and bumps the component's major.

## Everything at once

One item pulls in every `kit/*` component, and through them every primitive they need:

```bash
pnpm dlx shadcn-svelte@latest add https://coral.imlargo.dev/r/coral.json
```

Useful to look around in a scratch project. In a real one, add what you use.

## Updating

Re-run the same command with `--overwrite`:

```bash
pnpm dlx shadcn-svelte@latest add https://coral.imlargo.dev/r/kit-select.json -o
```

It overwrites the component's files with the current version and leaves everything else alone - so
if you edited the copy, that is the moment the edit disappears. Check what you changed first; that
is the trade Coral makes by handing you source instead of a dependency.

## Versioning

Each component carries its own version, in the file header and in
[`coral.json`](https://github.com/imlargo/coral/blob/main/packages/coral/src/lib/components/coral/coral.json),
and follows semver. The registry item repeats it under `meta.version`, so
`https://coral.imlargo.dev/r/kit-select.json` tells you what the current one is without installing
anything.

There is no single Coral version to track: you installed components, and what matters is which of
them are behind.

## Item names

A registry item is its manifest name with the slash swapped: `kit/select` is published as
`kit-select`, `lib/options` as `lib-options`. The prefix is not decoration - the CLI merges an
item's dependency tree by name, so an item called `select` would collide with shadcn-svelte's own
`select` and one of the two would be dropped, files and all.

[`/r/index.json`](https://coral.imlargo.dev/r/index.json) lists every item the registry serves.

## Or copy the folder

The registry is the convenient path, not the only one. Coral is still a folder, and taking it
whole still works:

```bash
npx degit imlargo/coral/packages/coral/src/lib/components/coral src/lib/components/coral
```

Then install the primitives each component declares under `shadcn` in `coral.json` yourself. You
keep the tests and lose the alias and icon rewriting, which is the trade.
