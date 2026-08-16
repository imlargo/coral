# AGENTS.md

Operating guide for AI agents (and humans) working in this repo. These rules are mandatory.

## What this repo is

Coral: Kora's internal component library, an ergonomics layer on top of shadcn-svelte. Not a
design system, not a fork, not an npm package — it's a folder meant to be copied into client
projects. See [`README.md`](./README.md) for stack and status, and
[`context/coral.md`](./context/coral.md) for the full philosophy — read it before any non-trivial
change.

Coral lives in **`src/lib/coral/`** — one self-contained folder, copied whole into the target
project. Currently extracted: `kit/avatar`.

## Hard rules

- **Extraction only, never speculation.** A component enters Coral only after the same pattern has
  been written twice in a real, paid project. If asked to add something unproven, push back —
  it belongs in the consuming project's `features/` first.
- **No appearance.** No hardcoded colors, shadows, radii, or typography. Only layout utilities
  (`flex`, `gap-*`, `w-full`). Appearance is the shadcn theme's job, not Coral's.
- **No domain knowledge.** Never reference client entities (invoice, student, contract...).
- **`src/lib/components/ui/` is untouchable.** shadcn-managed, excluded from lint/format on
  purpose. Compose around it, never edit it.
- **Import direction is one-way:** `blocks/` → `kit/` → `ui/`. Never a headless library directly
  (`bits-ui`) — derive types from the shadcn component instead (`ComponentProps<typeof Avatar>`).
  Never a step backwards, never project domain types.
- **Every composed component exposes its pieces.** If a rare case forces someone to drop Coral and
  rebuild from raw shadcn, the component failed.

## Architecture

```
src/lib/
├─ components/ui/   → shadcn primitives (CLI-managed, untouchable)
├─ utils.ts         → cn (shadcn's)
└─ coral/           → 📦 the folder that gets copied
   ├─ coral.json    → manifest: version + required shadcn primitives per component
   └─ kit/          → composed, generic components — the actual product
      └─ avatar/
```

Coral touches exactly two things outside its own folder: `$lib/components/ui/*` and `$lib/utils`
(`cn`). Both are guaranteed by any shadcn-svelte project's `components.json`.

**Folders are created when something needs them, never in advance.** `blocks/` (app-level
compositions, rule of 3), `lib/` (shared utils, formatters, types) and `hooks/` don't exist yet
because nothing lives in them. A util with one consumer stays inside its component's folder —
`kit/avatar/initials.ts` — and moves to `lib/` the day a second component needs it.

**No barrels.** One component, one folder (`kit/avatar/{avatar.svelte,types.ts,initials.ts}`),
imported by file path. Consequence to respect: filenames are public API — renaming one breaks
every project that already copied it.

## Conventions

- API shape follows the component's nature, not a fixed rule: flat props only when there's a
  defensible canonical case, composition otherwise. When unsure, composition — a pile of boolean
  props (`showSearch`, `compact`) is a sign it's needed.
- Every component accepts and merges a `class` prop. Selectable components support two-way
  binding. Shared state in composed components flows through Svelte context, never hand-wired
  props.
- Never remove capability the shadcn primitive already had. Forward its props (`ComponentProps`),
  keep its bindables (`ref`, `loadingStatus`).
- Generic types (`Option<T = string>`), never closed/string-only shapes.
- Every file carries a version header, matched to an entry in `coral/coral.json`:
  ```ts
  /**
   * @coral/kit/combobox
   * @version 1.2.0
   */
  ```
  ```json
  { "kit/combobox": { "version": "1.2.0", "shadcn": ["popover", "command"], "npm": [] } }
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

Run them for real, read the output. ⚠️ `pnpm check` currently reports ~910 pre-existing errors from
generated `.svelte-kit/` output; filter with `pnpm check 2>&1 | grep src/lib/coral` until that's
fixed. And re-check the [Coral test](./context/coral.md#el-test-de-coral):
written twice already? defines appearance? knows the client's domain? right API shape? exposes its
pieces for the rare case?
