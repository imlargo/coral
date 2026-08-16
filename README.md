# Coral 🪸

**Kora's internal component library. Built on top of [shadcn-svelte](https://www.shadcn-svelte.com/). No styles of its own.**

> Coral is the layer that turns forty lines of composition into a single tag - without taking away your ability to recompose when you need to.

📄 **Working in this repo?** [`AGENTS.md`](./AGENTS.md) holds the mandatory rules - architecture, import contract, conventions, and the checklist before anything is considered done. Read it before adding or modifying a component.

---

## Project status

🚧 **Bootstrapping.** The SvelteKit + shadcn-svelte scaffold is ready (`src/lib/components/ui/`) and Coral lives in `src/lib/coral/`. Extracted so far: **`kit/avatar`**. The remaining folders (`blocks/`, `lib/`, `hooks/`) get created the day something actually needs them - never in advance.

Coral is **never built in the abstract**: a component only gets added once it has already been written at least twice in a paid Kora project. It grows the way a reef does - by sedimentation of real work, extracted _during_ paid projects, never as a side project.

---

## What Coral is

Coral is an **ergonomics layer** on top of shadcn-svelte - not a design system, not a fork. It removes the boilerplate that gets rewritten on every project: a combobox with search, a data table with sorting/filtering/pagination, a form with validation, a confirmation dialog - without closing the door on disassembling it when the case calls for it.

- **No styles of its own**: all visual appearance comes from the project's shadcn theme.
- **No business domain knowledge**: Coral never knows about invoices, clients, or courses.
- **Copied, not installed**: the code becomes the project's own, not an npm dependency.
- **Localized by default**: `es-CO`, COP currency, and local date formats out of the box.

### What it actually contributes

The point isn't shorter markup. When you compose with Coral, this is already resolved and you never
wire it again: filtering and search, keyboard navigation, shared state between the pieces (through
context, not hand-passed props), accessibility, debounce, multi-select, loading and empty states.

That's the real difference between composing with Coral and composing with raw shadcn - and it's
what justifies the library even for the components that have no flat API. A composed component that
only saves typing doesn't belong here.

What justifies Coral even when you end up composing anyway: it ships the **behavior already resolved** - filtering, keyboard navigation, shared state through context, accessibility, debounce, loading and empty states. You assemble the pieces; you never re-wire the logic.

---

## Architecture

Coral is a **single self-contained folder**. Installing it in a project is copying `src/lib/coral/` across; nothing else in this repo travels.

```
src/lib/
├─ components/ui/   → shadcn-svelte (owned by the project - Coral does NOT touch it)
├─ utils.ts         → cn (shadcn's)
└─ coral/           → 📦 the folder that gets copied
   ├─ coral.json    → manifest: version + required shadcn primitives per component
   └─ kit/          → composed components ← the real product
      └─ avatar/
```

`blocks/` (rule of 3), `lib/` (shared utils, formatters, types) and `hooks/` appear when a component actually needs them. Until then, a util with one consumer stays in its component's folder.

**Import contract (critical rule):** Coral only imports from `$lib/components/ui/*`, `$lib/utils` (`cn`), and other Coral files. Never directly from a headless library (`bits-ui`, etc.) or from project domain types.

```ts
// ✅ inside Coral
import { Avatar } from '$lib/components/ui/avatar/index.js';

// ✅ from the project, consuming Coral - by file path, no barrels
import Avatar from '$lib/coral/kit/avatar/avatar.svelte';

// ❌
import { Avatar } from 'bits-ui';
import type { Invoice } from '$lib/types';
```

Need a type the headless library owns? Derive it from the shadcn component instead: `ComponentProps<typeof Avatar>`.

---

## Components

| Component                                                | Version | shadcn primitives |
| -------------------------------------------------------- | ------- | ----------------- |
| [`kit/avatar`](./src/lib/coral/kit/avatar/avatar.svelte) | 1.0.0   | `avatar`          |

### `kit/avatar`

Flat props, because an avatar has a defensible canonical case: an image with a text fallback. What Coral resolves is deriving the initials and collapsing three shadcn tags into one.

```svelte
<script lang="ts">
	import Avatar from '$lib/coral/kit/avatar/avatar.svelte';
</script>

<Avatar src="/juan.jpg" name="Juan Largo" />
<!-- no src → falls back to JL -->
<Avatar name="Juan Largo" size="lg" />
<!-- explicit text wins over the derived initials -->
<Avatar fallback="+3" />
```

| Prop       | Type                | Notes                                                           |
| ---------- | ------------------- | --------------------------------------------------------------- |
| `src`      | `string`            | Absent or failing to load → the fallback shows                  |
| `alt`      | `string`            | Defaults to `name`, then to `''` (decorative)                   |
| `name`     | `string`            | Derives the initials and the default `alt`                      |
| `fallback` | `string \| Snippet` | Overrides the derived initials - text, or a snippet for an icon |
| `children` | `Snippet`           | Extra content inside the root, e.g. an `AvatarBadge`            |

Everything the shadcn root accepts is forwarded untouched: `size`, `class`, `delayMs`, `bind:ref`, `bind:loadingStatus`, any div attribute.

**Initials rule:** first letter of the first word + first letter of the last word, so `María del Carmen García` → `MG`. A single word yields a single letter. Uppercased with `es-CO` rules, accents preserved. Exported on its own from [`initials.ts`](./src/lib/coral/kit/avatar/initials.ts) for when you drop down to raw shadcn.

**Deliberately absent:** no `AvatarGroup` (shadcn already ships `AvatarGroup` and `AvatarGroupCount` for stacking and `+N` - Coral would only be aliasing them), no `square` variant (that's a radius, and radii belong to the theme), no hex `bg`/`color` props (they bypass the theme and break in dark mode - use `class`).

---

## Stack

- **[SvelteKit](https://svelte.dev/docs/kit)** (Svelte 5) - Svelte-first, no multi-framework support for now.
- **[shadcn-svelte](https://www.shadcn-svelte.com/)** - base primitives, managed via `components.json`.
- **[Tailwind CSS v4](https://tailwindcss.com/)** - layout-only classes inside Coral (`flex`, `gap`, `w-full`); never hardcoded color.
- **TypeScript**, **Vitest**, **ESLint** + **Prettier**, **Husky** + **lint-staged**.
- **Cloudflare Workers** (`wrangler`) as the deploy target for the playground.

---

## Development

```sh
pnpm install

# dev server
pnpm dev

# type-check (wrangler types + SvelteKit sync + svelte-check)
pnpm check

# lint / format
pnpm lint
pnpm format

# tests
pnpm test

# production build
pnpm build
```

To add a new shadcn-svelte primitive:

```sh
pnpm dlx shadcn-svelte@latest add <component>
```

---

## Quick conventions

| Rule                      | Detail                                                                            |
| ------------------------- | --------------------------------------------------------------------------------- |
| One component, one folder | `coral/kit/combobox/{combobox.svelte,types.ts}`                                   |
| No barrels                | Import by file path. Filenames are public API - renaming one is a breaking change |
| No name prefix            | `Combobox`, not `CCombobox` - the folder disambiguates                            |
| Layout classes only       | `flex`, `gap`, `w-full`. Never `bg-blue-500`                                      |
| `class` always accepted   | Every component accepts and merges `class` for overrides                          |
| Never lose capability     | Forward the primitive's props and bindables; Coral adds, it doesn't subtract      |
| Versioned header          | `@coral/kit/combobox` + `@version` in every file, plus an entry in `coral.json`   |

Full conventions, the import contract, and versioning in [`AGENTS.md`](./AGENTS.md).

---

## Extraction roadmap

Ordered by rewrite cost × frequency (not by what's fun to build):

1. Combobox / Select with search - the one that hurts most; it validates the whole architecture
2. DataTable (sorting, filtering, pagination, empty state) - highest cost per project
3. Form field + validation + dynamic form
4. Formatters for `es-CO` / COP / dates
5. Confirm dialog
6. ~~Avatar with flat props~~ ✅ `kit/avatar` 1.0.0
7. Empty states and skeletons
8. Charts with presets
9. App shell (block) - needs the rule of 3
10. Generic CRUD page (block)

**How the architecture gets validated:** extract the combobox from the project in flight, use it in the other project the same week, and see whether it survives untouched. If that cycle works - extract, reuse, don't modify - the architecture holds. Better to find out with one component than with twenty.

---

## The Coral test

Before adding or changing anything, ask:

1. **Have I already written this twice?** → If not, it doesn't belong yet.
2. **Does this define appearance?** → If so, it doesn't belong in Coral.
3. **Does this know about my client?** → If so, it belongs in the project's `features/`.
4. **Does the interface match the component's nature?** → Flat props only if there's a canonical case; otherwise, composition.
5. **Does the rare case force me to abandon Coral?** → If so, pieces need to be exposed.
