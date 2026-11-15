---
title: Installation
description: One command per component. It lands in your project as source you own, with its primitives already resolved.
group: Getting started
---

Coral is installed with the shadcn-svelte CLI, from Coral's registry, one component at a time. Each
component lands in `src/lib/components/coral/`, next to the `ui/` folder shadcn-svelte keeps
there, and from that moment it is yours.

## Requirements

- **Svelte 5.** Every component is written with runes.
- **Tailwind CSS v4**, as shadcn-svelte sets it up.
- **A project initialized with shadcn-svelte**: a `components.json`, a `src/lib/components/ui/`
  folder and `src/lib/utils.ts` exporting `cn`.

Those paths, plus the icons your `components.json` names under `iconLibrary`, are the only things
Coral reaches for outside its own folder. Coral never imports SvelteKit, so it runs in a plain
Svelte + Vite project as well as in SvelteKit. The end-to-end install test in CI uses SvelteKit.

## Set up shadcn-svelte

Skip this if `components.json` already exists.

### SvelteKit

```bash
pnpm dlx sv create my-app
cd my-app
pnpm dlx sv add tailwindcss
pnpm dlx shadcn-svelte@latest init
```

SvelteKit already resolves `$lib`, so `init` only asks for your base color and where your global
CSS lives.

### Svelte + Vite

A Vite project has no `$lib` alias until you add one, and shadcn-svelte's components import
through it. Follow
[shadcn-svelte's Vite guide](https://shadcn-svelte.com/docs/installation/vite): add Tailwind with
`sv add tailwindcss`, point `$lib` at `src/lib` in `tsconfig.json`, `tsconfig.app.json` and
`vite.config.ts`, then run `init`:

```ts
// vite.config.ts
import path from 'node:path';
import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
	plugins: [tailwindcss(), svelte()],
	resolve: { alias: { $lib: path.resolve('./src/lib') } }
});
```

```bash
pnpm dlx shadcn-svelte@latest init
```

From here on, both setups install Coral the same way.

## Add a component

```bash
pnpm dlx shadcn-svelte@latest add https://coral.imlargo.dev/r/kit-combobox.json
```

Every component page prints its own command, for the package manager you pick. That one line:

- **Installs the shadcn primitives it composes.** `kit-combobox` brings `popover`, `command`,
  `button` and `badge`, in your style, if they are not there yet.
- **Installs the Coral modules it shares.** `lib/options` (the `Option<T>` vocabulary),
  `lib/fold` (accent folding) and the rest come along; you never ask for them by name.
- **Rewrites imports to your aliases.** Coral is written against `#lib/components/ui/*` and
  `#lib/utils.js`; what lands is written against whatever your `components.json` says.
- **Maps icons to your icon library.** A project on `@tabler/icons-svelte` gets Tabler icons, not
  a broken import.

## Use it

There are no barrels. One component, one folder, imported by file path:

```svelte
<script lang="ts">
	import Combobox from '#lib/components/coral/kit/combobox/combobox.svelte';

	const repositories = [
		{ value: 'web', label: 'web' },
		{ value: 'api', label: 'api' },
		{ value: 'billing-worker', label: 'billing-worker' }
	];

	let repository = $state<string>();
</script>

<Combobox options={repositories} bind:value={repository} placeholder="Select a repository..." />
```

`#lib` is the alias Coral's own source uses; in your project the import starts with your alias,
usually `$lib`.

## Where it lands

Under your `components` alias, beside shadcn's `ui/`, in the same shape the repository keeps:

```
src/lib/components/
├─ ui/                          ← shadcn-svelte
└─ coral/                       ← Coral
   ├─ kit/combobox/combobox.svelte
   ├─ kit/combobox/types.ts
   ├─ lib/fold.ts
   └─ lib/options.ts
```

Coral's files reach each other by relative path, so the folder works wherever your alias points.
Tests are not published: they are written against this repository's test setup.

## Everything at once

One item pulls in every component, and through them every primitive they need:

```bash
pnpm dlx shadcn-svelte@latest add https://coral.imlargo.dev/r/coral.json
```

Useful to look around in a scratch project. In a real one, add what you use.

## Without the CLI

Every component page has a **Manual** tab: the primitives to add, the packages to install and
every file to copy, with links to each. Or take the whole folder:

```bash
pnpm dlx degit imlargo/coral/packages/coral/src/lib/components/coral src/lib/components/coral
```

Then add the primitives each component lists under `shadcn` in
[`coral.json`](https://github.com/imlargo/coral/blob/main/packages/coral/src/lib/components/coral/coral.json),
and point the `#lib/...` imports at your aliases. You keep the tests and lose the alias and icon
rewriting.

## Next

- [Theming](/docs/theming): why Coral already looks like your app.
- [Ownership and updates](/docs/ownership): updating, local edits and versions.
- [Registry](/docs/registry): item names, the index and what an item pulls in.
