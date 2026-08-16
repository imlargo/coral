# AGENTS.md

Operating guide for AI agents (and humans) working in this repo. These rules are mandatory.

## What this repo is

Coral: Kora's internal component library, an ergonomics layer on top of shadcn-svelte. Not a
design system, not a fork, not an npm package — it's a folder meant to be copied into client
projects. See [`README.md`](./README.md) for stack and status, and
[`context/coral.md`](./context/coral.md) for the full philosophy — read it before any non-trivial
change.

Currently bootstrapping: no `coral/` components exist yet, only the shadcn `ui/` scaffold.

## Hard rules

- **Extraction only, never speculation.** A component enters Coral only after the same pattern has
  been written twice in a real, paid project. If asked to add something unproven, push back —
  it belongs in the consuming project's `features/` first.
- **No appearance.** No hardcoded colors, shadows, radii, or typography. Only layout utilities
  (`flex`, `gap-*`, `w-full`). Appearance is the shadcn theme's job, not Coral's.
- **No domain knowledge.** Never reference client entities (invoice, student, contract...).
- **`src/lib/components/ui/` is untouchable.** shadcn-managed, excluded from lint/format on
  purpose. Compose around it, never edit it.
- **Import direction is one-way:** `blocks/` → `kit/` → `ui/`, plus Coral's own `lib/`. Never a
  headless library directly (`bits-ui`), never a step backwards, never project domain types.
- **Every composed component exposes its pieces.** If a rare case forces someone to drop Coral and
  rebuild from raw shadcn, the component failed.

## Architecture

```
src/lib/components/
├─ ui/              → shadcn primitives (CLI-managed)
└─ coral/
   ├─ kit/          → composed, generic components — the actual product
   ├─ blocks/       → app-level compositions, only after repeating 3 times
   ├─ lib/          → shared utils, formatters (es-CO/COP/dates), types
   └─ hooks/        → reusable non-UI logic
```

One component, one folder, with an `index.ts` barrel (`coral/kit/combobox/{combobox.svelte,types.ts,index.ts}`). Always import from the barrel.

## Conventions

- API shape follows the component's nature, not a fixed rule: flat props only when there's a
  defensible canonical case, composition otherwise. When unsure, composition — a pile of boolean
  props (`showSearch`, `compact`) is a sign it's needed.
- Every component accepts and merges a `class` prop. Selectable components support two-way
  binding. Shared state in composed components flows through Svelte context, never hand-wired
  props.
- Generic types (`Option<T = string>`), never closed/string-only shapes.
- Every file carries a version header matched to an entry in `coral.json`:
  ```ts
  /**
   * @coral/kit/combobox
   * @version 1.2.0
   */
  ```

## Formatting

Tabs, single quotes, no trailing commas, 100 cols — enforced by Prettier, don't fight it. Tailwind
classes are auto-sorted; don't hand-order them.

## Commands

```sh
pnpm dev      # dev server
pnpm check    # type-check
pnpm lint     # prettier --check + eslint
pnpm format   # prettier --write
pnpm test     # vitest
```

`pnpm dlx shadcn-svelte@latest add <component>` to add a new shadcn primitive.

## Before considering something done

```sh
pnpm lint
pnpm check
pnpm test
```

Run them for real, read the output. And re-check the [Coral test](./context/coral.md#el-test-de-coral):
written twice already? defines appearance? knows the client's domain? right API shape? exposes its
pieces for the rare case?
