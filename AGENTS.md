# AGENTS.md

Operating guide for AI agents (and humans) working in this repo. These rules are mandatory.

## What this repo is

Coral: an open-source ergonomics layer on top of shadcn-svelte. Not a design system, not a fork,
not an npm package - it's a folder meant to be copied into a project, which then owns it. It began
as an internal library and is now public, built in the open for an international audience - nothing
in it should still read as internal. See [`README.md`](./README.md) for stack, install and status,
and **Language and demos** below for what that means line by line.

This file is self-contained: every rule you need is here. (`context/coral.md` holds the long-form
philosophy but is deliberately untracked - don't assume a reader has it.)

Coral lives in **`src/lib/coral/`** - one self-contained folder, copied whole into the target
project. Currently: `kit/{action-button, activity-calendar, avatar, avatar-stack, combobox,
command-palette, confirm-dialog, copy-button, date-picker, file-input, inline-edit, number-input,
password-input, rating-group, relative-time, reorder-list, responsive-dialog, search-input, select,
shortcut, show-more, stepper, tags-input, toc, tree-view}`, over
`lib/{action, debounce, hidden-field, options}`.
`src/lib/coral/coral.json` is the list that counts - read it rather than this sentence, which is the
kind that goes stale.

## Hard rules

- **Extraction only, never speculation.** A component enters Coral only after the same pattern has
  been written twice in real production work - by the maintainer or by a contributor who can name
  the two places. If asked to add something unproven, push back - it belongs in the consuming
  project's `features/` first.
- **No appearance.** No hardcoded colors, shadows, radii, or typography. Only layout utilities
  (`flex`, `gap-*`, `w-full`). Appearance is the shadcn theme's job, not Coral's.
- **No domain knowledge.** Never reference a consuming app's entities (invoice, student,
  contract...) in `kit/`. Demos are the exception and have their own rules - see **Language and
  demos**.
- **`src/lib/components/ui/` is untouchable.** shadcn-managed, excluded from lint/format on
  purpose. Compose around it, never edit it.
- **Import direction is one-way:** `blocks/` → `kit/` → `ui/`. `kit/` composing `kit/` is fine and
  desirable; the reverse never is. Never a headless library directly (`bits-ui`) - derive its types
  from the shadcn component instead (`ComponentProps<typeof Avatar>`). Never project domain types.
- **Nothing duplicated.** Two components needing the same logic means extracting a third, or
  `lib/` - never copy-paste inside Coral.
- **Every composed component exposes its pieces.** If a rare case forces someone to drop Coral and
  rebuild from raw shadcn, the component failed.
- **Composition must earn its keep.** What Coral contributes is resolved behavior - filtering,
  keyboard navigation, shared state through context, accessibility, debounce, loading and empty
  states - not syntactic sugar. A composed component that only saves typing doesn't belong.

## Architecture

```
src/lib/
├─ components/ui/   → shadcn primitives (CLI-managed, untouchable)
├─ utils.ts         → cn (shadcn's)
└─ coral/           → 📦 the folder that gets copied
   ├─ coral.json    → manifest: version + required shadcn primitives per component
   ├─ lib/          → shared across components (options.ts, hidden-field.svelte)
   └─ kit/          → composed, generic components - the actual product
      └─ avatar/
```

Outside its own folder, Coral may reach for exactly three things: `$lib/components/ui/*`,
`$lib/utils` (`cn`), and `@lucide/svelte` for icons. All three are guaranteed by a shadcn-svelte
project's `components.json` - the first two by its aliases, the third by `iconLibrary`, which is
why an icon import must stay `@lucide/svelte` and must be declared under `npm` in `coral.json`.
Reach for as few as the component actually needs - `kit/avatar` uses only the first.

**Folders are created when something needs them, never in advance.** `blocks/` (app-level
compositions, rule of 3) and `hooks/` don't exist yet because nothing lives in them. A util with one
consumer stays inside its component's folder - `kit/avatar/initials.ts` - and moves to `lib/` the
day a second component needs it, which is how `lib/options.ts` and `lib/hidden-field.svelte` got
there.

**No barrels.** One component, one folder (`kit/avatar/{avatar.svelte,types.ts,initials.ts}`),
imported by file path. Consequence to respect: filenames are public API - renaming one breaks
every project that already copied it.

## Conventions

- API shape follows the component's nature, not a fixed rule: flat props only when there's a
  defensible canonical case, composition otherwise. When unsure, composition - a pile of boolean
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
  `shadcn` and `npm` are what makes installing Coral "copy the folder, then install these" -
  declare every primitive the component imports. Omit `npm` when there are none.

## Language and demos

The rules most often missed, because nothing in the code enforces them.

- **Everything ships in English** - UI strings, comments, tests, demo data, docs. Coral is read by
  people who do not share the maintainer's first language, so a Spanish label in a demo is a defect
  like any other. Translate on sight rather than leaving it for a later pass.
- **Demos live in a dev/SaaS product world**, because that is what the reader is building:
  projects, repositories, deployments, environments, API keys, team members and invites, issues,
  builds, webhooks, plans and seats. Never invoices, contracts, tax ids, construction sites or
  clinics.
- **People come from one cast**, so the docs read as one product rather than a pile of samples:
  Amara Diallo, Wei Zhang, Sofia Rossi, Liam O'Connor, Priya Sharma, Kenji Tanaka, Lucas Andersen,
  Elena van der Meer.
- **Plain option lists use fruits** - Açaí, Guava, Kiwi, Mango, Papaya, Lychee. A deliberate
  convention, matching Radix and shadcn docs, and a standing reminder that search folds accents.
  Don't "improve" them into something else.
- **No provenance claims.** Never cite private codebases as evidence: "three projects wrote this",
  "every copy in the corpus", counts of files or repos. A reader cannot check any of it, and it
  leaks client names. Say what goes wrong when the thing is hand-rolled, and what Coral does
  instead. The admission rule under **Hard rules** is policy and stays - the counting does not.
- **Locale is never a region.** A `locale` prop defaults to `en-US`; a helper that formats without
  one passes `undefined` and follows the reader's own locale. Don't hardcode a country.
- **A docs page is `index.md` plus `demos/*.svelte`**, found by glob - there is no registry to
  update. `<Preview name="kit/<component>/<demo>" />` embeds one. Frontmatter `title` is what the
  sidebar shows: spelled out, sentence case - "Table of contents", not "Toc".
- **Change a demo, resync its `index.md`.** Prose quoting a demo's strings is the first thing to
  rot.

## Formatting

Tabs, single quotes, no trailing commas, 100 cols - enforced by Prettier, don't fight it. Tailwind
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

Expect `pnpm check` to report **12** errors, none of them yours: 7 for a missing `hast` type
package and 4 in `svmd-highlight.js` - both docs tooling - plus shadcn's untouchable
`ui/native-select`. Anything else is yours.

> ⚠️ `pnpm check` currently stops **before** `svelte-check` runs: `wrangler types --check` reports
> `worker-configuration.d.ts` out of date, because the committed file was generated with a newer
> wrangler than `^4.97.0` resolves to here. Regenerating downgrades ~27k lines to that older
> wrangler's output - don't.
> Until that floor is bumped, type-check with
> `npx svelte-kit sync && npx svelte-check --tsconfig ./tsconfig.json`, and read the count above.
> A green `pnpm check` that printed no `COMPLETED` line did not type-check anything.

> ⚠️ **Build output poisons both scripts, so `build` and `check` delete it first.** `vite build`
> writes a bundled worker to `.svelte-kit/cloudflare/` plus `.svelte-kit/output/`, and that breaks
> two things at once:
>
> - `svelte-check` discovers files by walking the workspace - it ignores tsconfig `exclude`, and
>   its own `--ignore` flag refuses to run alongside `--tsconfig` - so it type-checks the generated
>   worker and reports ~900 errors nobody wrote.
> - `wrangler types` emits a `GlobalProps.mainModule` block **only when that worker exists**, so
>   `wrangler types --check` passes on a clean tree and fails on a dirty one. Cloudflare restores a
>   build-output cache between runs, which made CI fail on every build after the first.
>
> Consequence to respect: **run `check` before `build`, never after** - it deletes the artifact you
> were about to deploy. And run `pnpm gen` on a clean tree, or you commit a
> `worker-configuration.d.ts` that references build output and breaks CI.

> ⚠️ `worker-configuration.d.ts` declares a global `Element` whose HTMLRewriter `append`/`prepend`
> signatures merge with - and shadow - the DOM ones. Use `appendChild` / `insertBefore` in DOM code.

> ⚠️ `mod` in a `kit/shortcut` combo resolves to Cmd on a Mac and Ctrl everywhere else, from the
> real browser via `detectPlatform()`. A test that presses Control against a `mod+k` binding passes
> in CI and fails on a Mac - spell `ctrl` or `meta` explicitly in test fixtures.

> ⚠️ Cloudflare's build image defaults to **pnpm 10.11.1** and does not read `packageManager` from
> `package.json`; the override is a `PNPM_VERSION` build variable in the dashboard. Keep
> `pnpm-workspace.yaml`'s `packages: ['.']` - older 10.x refuses a workspace file without it.

Then re-check the **Coral test**:

1. **Written twice already?** → If not, it doesn't enter yet.
2. **Does it define appearance?** → If so, it doesn't belong in Coral.
3. **Does it know your app's domain?** → If so, it belongs in the project's `features/`.
4. **Does the API match the component's nature?** → Flat props only if there's a canonical case;
   otherwise composition.
5. **Does the rare case force abandoning Coral?** → If so, expose the pieces.
