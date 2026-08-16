# AGENTS.md

Operating guide for AI agents (and humans) working in this repo. These rules are mandatory.

## What this repo is

Coral: Kora's internal component library, an ergonomics layer on top of shadcn-svelte. Not a
design system, not a fork, not an npm package — it's a folder meant to be copied into client
projects. See [`README.md`](./README.md) for stack and status.

This file is self-contained: every rule you need is here. (`context/coral.md` holds the long-form
philosophy but is deliberately untracked — don't assume a reader has it.)

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
- **Import direction is one-way:** `blocks/` → `kit/` → `ui/`. `kit/` composing `kit/` is fine and
  desirable; the reverse never is. Never a headless library directly (`bits-ui`) — derive its types
  from the shadcn component instead (`ComponentProps<typeof Avatar>`). Never project domain types.
- **Nothing duplicated.** Two components needing the same logic means extracting a third, or
  `lib/` — never copy-paste inside Coral.
- **Every composed component exposes its pieces.** If a rare case forces someone to drop Coral and
  rebuild from raw shadcn, the component failed.
- **Composition must earn its keep.** What Coral contributes is resolved behavior — filtering,
  keyboard navigation, shared state through context, accessibility, debounce, loading and empty
  states — not syntactic sugar. A composed component that only saves typing doesn't belong.

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

Outside its own folder, Coral may reach for exactly two things: `$lib/components/ui/*` and
`$lib/utils` (`cn`). Both are guaranteed by any shadcn-svelte project's `components.json`, which is
what keeps the folder portable. Reach for as few as the component actually needs — `kit/avatar`
uses only the first.

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
- Never remove capability the wrapped primitive already had. Forward its props
  (`ComponentProps<typeof X>`) and keep whatever it exposes for binding (`ref`, and friends).
- Generic types (`Option<T = string>`), never closed/string-only shapes.
- Every file carries a version header, matched to an entry in `src/lib/coral/coral.json`:
  ```ts
  /**
   * @coral/kit/combobox
   * @version 1.2.0
   */
  ```
  ```json
  {
  	"components": {
  		"kit/combobox": { "version": "1.2.0", "shadcn": ["popover", "command"], "npm": ["cmdk"] }
  	}
  }
  ```
  `shadcn` and `npm` are what makes installing Coral "copy the folder, then install these" —
  declare every primitive the component imports. Omit `npm` when there are none.

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

Run them for real, read the output.

> ⚠️ `pnpm check` reports ~900 pre-existing errors, all but one from build output. `vite build`
> writes a bundled worker to `.svelte-kit/cloudflare/` plus `.svelte-kit/output/`, and
> `svelte-check` discovers files by walking the workspace — it ignores tsconfig `exclude`, and its
> own `--ignore` flag refuses to run alongside `--tsconfig`. So there is no config fix: on a clean
> tree the count is **1** (shadcn's `ui/native-select`, untouchable), and it only balloons after a
> build. `rm -rf .svelte-kit/cloudflare .svelte-kit/output` before checking, or filter:
> `pnpm check 2>&1 | grep -v '\.svelte-kit'`.
>
> Related landmine: `worker-configuration.d.ts` declares a global `Element` whose HTMLRewriter
> `append`/`prepend` signatures merge with — and shadow — the DOM ones. Use `appendChild` /
> `insertBefore` in DOM code.

Then re-check the **Coral test**:

1. **Written twice already?** → If not, it doesn't enter yet.
2. **Does it define appearance?** → If so, it doesn't belong in Coral.
3. **Does it know the client's domain?** → If so, it belongs in the project's `features/`.
4. **Does the API match the component's nature?** → Flat props only if there's a canonical case;
   otherwise composition.
5. **Does the rare case force abandoning Coral?** → If so, expose the pieces.
