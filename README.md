# Coral 🪸

**Kora's internal component library. Built on top of [shadcn-svelte](https://www.shadcn-svelte.com/). No styles of its own.**

> Coral is the layer that turns forty lines of composition into a single tag — without taking away your ability to recompose when you need to.

📄 **Full project context:** [`context/coral.md`](./context/coral.md) — read it before adding or modifying any component. This README is the operational entry point; that document is the source of truth on philosophy, inclusion criteria, and architecture.

---

## Project status

🚧 **Initializing.** No Coral components have been extracted yet — the repo has the SvelteKit + shadcn-svelte scaffold ready (`src/lib/components/ui/`), and Coral's own folders (`kit/`, `blocks/`, `lib/`, `hooks/`) will be created as components get extracted from real projects.

Coral is **never built in the abstract**: a component only gets added once it has already been written at least twice in a paid Kora project. See [section 7 of `coral.md`](./context/coral.md#7-criterio-de-inclusión) before adding anything.

---

## What Coral is

Coral is an **ergonomics layer** on top of shadcn-svelte — not a design system, not a fork. It removes the boilerplate that gets rewritten on every project: a combobox with search, a data table with sorting/filtering/pagination, a form with validation, a confirmation dialog — without closing the door on disassembling it when the case calls for it.

- **No styles of its own**: all visual appearance comes from the project's shadcn theme.
- **No business domain knowledge**: Coral never knows about invoices, clients, or courses.
- **Copied, not installed**: the code becomes the project's own, not an npm dependency.
- **Localized by default**: `es-CO`, COP currency, and local date formats out of the box.

Full detail in [`context/coral.md`](./context/coral.md).

---

## Architecture

```
src/lib/components/
├─ ui/              → shadcn-svelte (owned by the project — Coral does NOT touch it)
└─ coral/
   ├─ kit/          → composed components ← the real product
   ├─ blocks/       → app-level compositions (rule of 3)
   ├─ lib/          → shared utils, formatters, types
   └─ hooks/        → reusable logic without UI
```

**Import contract (critical rule):** Coral only imports from `@/components/ui/*`, from other Coral components, and from its own `lib/`. Never directly from a headless library (`bits-ui`, etc.) or from project domain types.

```ts
// ✅
import { Popover } from '@/components/ui/popover';
import { Pagination } from '@/components/coral/kit/pagination';

// ❌
import { Popover } from 'bits-ui';
import type { Invoice } from '@/lib/types';
```

---

## Stack

- **[SvelteKit](https://svelte.dev/docs/kit)** (Svelte 5) — Svelte-first, no multi-framework support for now.
- **[shadcn-svelte](https://www.shadcn-svelte.com/)** — base primitives, managed via `components.json`.
- **[Tailwind CSS v4](https://tailwindcss.com/)** — layout-only classes inside Coral (`flex`, `gap`, `w-full`); never hardcoded color.
- **TypeScript**, **Vitest**, **ESLint** + **Prettier**, **Husky** + **lint-staged**.
- **Cloudflare Workers** (`wrangler`) as the deploy target for the playground.

---

## Development

```sh
pnpm install

# dev server
pnpm dev

# type-check + SvelteKit sync
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

| Rule                      | Detail                                                                          |
| ------------------------- | ------------------------------------------------------------------------------- |
| One component, one folder | `coral/kit/combobox/` with the component, types, and an `index.ts`              |
| Export from `index.ts`    | Always. Never deep imports from outside.                                        |
| No name prefix            | `Combobox`, not `CCombobox` — the folder disambiguates                          |
| Layout classes only       | `flex`, `gap`, `w-full`. Never `bg-blue-500`                                    |
| `class` always accepted   | Every component accepts and merges `class` for overrides                        |
| Versioned header          | `@coral/kit/combobox` + `@version` in every file, plus an entry in `coral.json` |

Full conventions, the `Option<T>` type, and versioning in [`context/coral.md` § 6–8](./context/coral.md#6-convenciones).

---

## Extraction roadmap

Ordered by rewrite cost × frequency (not by what's fun to build):

1. Combobox / Select with search
2. DataTable (sorting, filtering, pagination, empty state)
3. Form field + validation + dynamic form
4. Formatters for `es-CO` / COP / dates
5. Confirm dialog
6. Avatar with flat props
7. Empty states and skeletons
8. Charts with presets
9. App shell (block)
10. Generic CRUD page (block)

Detail in [`context/coral.md` § 9](./context/coral.md#9-roadmap-de-extracción).

---

## The Coral test

Before adding or changing anything, ask:

1. **Have I already written this twice?** → If not, it doesn't belong yet.
2. **Does this define appearance?** → If so, it doesn't belong in Coral.
3. **Does this know about my client?** → If so, it belongs in the project's `features/`.
4. **Does the interface match the component's nature?** → Flat props only if there's a canonical case; otherwise, composition.
5. **Does the rare case force me to abandon Coral?** → If so, pieces need to be exposed.
