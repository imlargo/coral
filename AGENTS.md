# AGENTS.md

Operating guide for AI agents (and humans) working in this repo. These rules are mandatory.

## What this repo is

Coral: an open-source ergonomics layer on top of shadcn-svelte. Not a design system, not a fork,
not an npm package. It's a folder installed into a project as source, which then owns it - through
its own shadcn-svelte registry, or copied whole. It began as an internal library and is now public,
built in the open for an international audience, so nothing in it should still read as internal.
See [`README.md`](./README.md) for stack, install and status, and **Language and demos** below for
what that means line by line.

This file is self-contained: every rule you need is here. (`context/coral.md` holds the long-form
philosophy but is deliberately untracked, so don't assume a reader has it.)

The repo is a pnpm workspace with two members: **`packages/coral`**, the library, and
**`apps/docs`**, the site that documents it. Coral itself lives in
**`packages/coral/src/lib/components/coral/`**, one self-contained folder that lands in the target
project at `$lib/components/coral/`, beside shadcn's `ui/`. Currently: `kit/{action-button,
activity-calendar, avatar, avatar-stack, combobox, command-palette, confirm-dialog, copy-button,
date-picker, file-input, inline-edit, number-input, password-input, rating-group, relative-time,
reorder-list, responsive-dialog, search-input, select, shortcut, show-more, stepper, tags-input,
toc, tree-view}`, over `lib/{action, debounce, hidden-field, options}`.
`packages/coral/src/lib/components/coral/coral.json` is the list that counts. Read it rather than
this sentence, which is the kind that goes stale.

## Hard rules

- **Extraction only, never speculation.** A component enters Coral only after the same pattern has
  been written twice in real production work, either by the maintainer or by a contributor who can
  name the two places. If asked to add something unproven, push back: it belongs in the consuming
  project's `features/` first.
- **No appearance.** No hardcoded colors, shadows, radii, or typography. Only layout utilities
  (`flex`, `gap-*`, `w-full`). Appearance is the shadcn theme's job, not Coral's.
- **No domain knowledge.** Never reference a consuming app's entities (invoice, student,
  contract...) in `kit/`. Demos are the exception and have their own rules (see **Language and
  demos**).
- **`packages/coral/src/lib/components/ui/` is untouchable.** shadcn-managed, excluded from
  lint/format on purpose. Compose around it, never edit it. It is the one shadcn install in the
  repo: the docs site resolves `$lib/components/ui/*` to it rather than keeping a second copy.
- **Import direction is one-way:** `blocks/` → `kit/` → `ui/`. `kit/` composing `kit/` is fine and
  desirable; the reverse never is. Never a headless library directly (`bits-ui`); derive its types
  from the shadcn component instead (`ComponentProps<typeof Avatar>`). Never project domain types.
- **Nothing duplicated.** Two components needing the same logic means extracting a third, or
  `lib/`. Never copy-paste inside Coral.
- **Every composed component exposes its pieces.** If a rare case forces someone to drop Coral and
  rebuild from raw shadcn, the component failed.
- **Composition must earn its keep.** What Coral contributes is resolved behavior (filtering,
  keyboard navigation, shared state through context, accessibility, debounce, loading and empty
  states), not syntactic sugar. A composed component that only saves typing doesn't belong.

## Architecture

```
packages/coral/              → the library
├─ coral.json is inside src/lib/components/coral/ - see below
├─ registry.config.js        → where the registry is published (one constant, both workspaces)
├─ registry.json             → GENERATED, gitignored. Never edit, never commit
├─ scripts/
│  ├─ registry.js            → derives the registry items from coral.json + the filesystem
│  ├─ build-registry.js      → writes registry.json and runs `shadcn-svelte registry build`
│  └─ smoke-install.js       → installs the built registry into a throwaway project, type-checks it
└─ src/
   ├─ app.css                → the shadcn baseline (theme vars). Not shipped; Coral has no appearance
   └─ lib/
      ├─ hooks/              → shadcn's own (is-mobile), not Coral's
      ├─ utils.ts            → cn (shadcn's)
      ├─ coral-manifest.test.ts → repo tooling: manifest ↔ folder ↔ registry ↔ docs pages
      └─ components/
         ├─ ui/              → shadcn primitives (CLI-managed, untouchable)
         └─ coral/           → 📦 the folder that gets installed, beside ui/
            ├─ coral.json    → manifest: title, description, version + required primitives
            ├─ lib/          → shared across components (options.ts, hidden-field.svelte)
            └─ kit/          → composed, generic components - the actual product
               └─ avatar/

apps/docs/                   → the documentation site (SvelteKit, Cloudflare)
├─ src/routes/docs/          → index.md + demos/*.svelte per component
├─ src/docs/                 → the site's own components, imported through `$docs`
└─ static/r/                 → GENERATED registry output, gitignored, served at /r/*
```

**The site's `$lib` is the library.** `apps/docs/svelte.config.js` sets `kit.files.lib` to
`packages/coral/src/lib`, so a demo renders the exact file the registry ships, through the same
import paths a consuming project resolves. Consequences to respect: the docs app's own code lives
under `$docs`, never `$lib`; and `$lib` cannot be redirected per subpath, because SvelteKit puts
its own `$lib` alias first and Vite takes the first match.

Outside its own folder, Coral may reach for exactly three things: `$lib/components/ui/*`,
`$lib/utils` (`cn`), and `@lucide/svelte` for icons. All three are guaranteed by a shadcn-svelte
project's `components.json` - the first two by its aliases, the third by `iconLibrary`, which is
why an icon import must stay `@lucide/svelte` and must be declared under `npm` in `coral.json`.
Reach for as few as the component actually needs: `kit/avatar` uses only the first.

**Folders are created when something needs them, never in advance.** `blocks/` (app-level
compositions, rule of 3) and `hooks/` don't exist yet because nothing lives in them. A util with one
consumer stays inside its component's folder (`kit/avatar/initials.ts`) and moves to `lib/` the
day a second component needs it, which is how `lib/options.ts` and `lib/hidden-field.svelte` got
there.

**No barrels.** One component, one folder (`kit/avatar/{avatar.svelte,types.ts,initials.ts}`),
imported by file path. Consequence to respect: filenames are public API. Renaming one breaks
every project that already copied it.

## Conventions

- API shape follows the component's nature, not a fixed rule: flat props only when there's a
  defensible canonical case, composition otherwise. When unsure, composition: a pile of boolean
  props (`showSearch`, `compact`) is a sign it's needed.
- Every component accepts and merges a `class` prop. Selectable components support two-way
  binding. Shared state in composed components flows through Svelte context, never hand-wired
  props.
- Never remove capability the wrapped primitive already had. Forward its props
  (`ComponentProps<typeof X>`) and keep whatever it exposes for binding (`ref`, and friends).
- Generic types (`Option<T = string>`), never closed/string-only shapes.
- Every file carries a version header, matched to an entry in `coral.json`:
  ```ts
  /**
   * @coral/kit/combobox
   * @version 1.2.0
   */
  ```
  ```json
  {
  	"components": {
  		"kit/combobox": {
  			"title": "Combobox",
  			"description": "A select with a search box, filtering the way accented text is actually typed.",
  			"version": "1.2.0",
  			"shadcn": ["popover", "command"],
  			"npm": ["cmdk"]
  		}
  	}
  }
  ```
  Everything downstream is derived from this entry: the registry item, the primitives the CLI
  installs alongside it, the version it reports. Declare every primitive the component imports;
  omit `npm` when there are none. `title` and `description` also have to match the component's
  docs page frontmatter - a test checks it, because a description that only drifts in one of the
  two places is invisible.

## Language and demos

The rules most often missed, because nothing in the code enforces them.

- **Everything ships in English:** UI strings, comments, tests, demo data, docs. Coral is read by
  people who do not share the maintainer's first language, so a Spanish label in a demo is a defect
  like any other. Translate on sight rather than leaving it for a later pass.
- **Demos live in a dev/SaaS product world**, because that is what the reader is building:
  projects, repositories, deployments, environments, API keys, team members and invites, issues,
  builds, webhooks, plans and seats. Never invoices, contracts, tax ids, construction sites or
  clinics.
- **People come from one cast**, so the docs read as one product rather than a pile of samples:
  Amara Diallo, Wei Zhang, Sofia Rossi, Liam O'Connor, Priya Sharma, Kenji Tanaka, Lucas Andersen,
  Elena van der Meer.
- **Plain option lists use fruits:** Açaí, Guava, Kiwi, Mango, Papaya, Lychee. A deliberate
  convention, matching Radix and shadcn docs, and a standing reminder that search folds accents.
  Don't "improve" them into something else.
- **No provenance claims.** Never cite private codebases as evidence: "three projects wrote this",
  "every copy in the corpus", counts of files or repos. A reader cannot check any of it, and it
  leaks client names. Say what goes wrong when the thing is hand-rolled, and what Coral does
  instead. The admission rule under **Hard rules** is policy and stays; the counting does not.
- **Locale is never a region.** A `locale` prop defaults to `en-US`; a helper that formats without
  one passes `undefined` and follows the reader's own locale. Don't hardcode a country.
- **A docs page is `index.md` plus `demos/*.svelte`**, found by glob; there is no index to
  update. `<Preview name="kit/<component>/<demo>" />` embeds one. Frontmatter `title` is what the
  sidebar shows, spelled out in sentence case ("Table of contents", not "Toc"), and it has to
  match `coral.json`. The install command is not written into the page - every `kit/*` page gets
  one rendered for it.
- **Change a demo, resync its `index.md`.** Prose quoting a demo's strings is the first thing to
  rot.

## Registry

Coral is published as a shadcn-svelte registry, served by the docs site at `/r/*.json` and
installed with `pnpm dlx shadcn-svelte@latest add <url>`.

- **`registry.json` is generated.** `scripts/registry.js` derives it from `coral.json` and the
  folder; `pnpm --filter coral registry` writes it and runs the CLI's `registry build` into
  `apps/docs/static/r/`. Both outputs are gitignored. Editing either by hand is editing a build
  artifact.
- **Item names are `kit-*` and `lib-*`**, the manifest name with the slash swapped. Never publish
  an item under a bare name: the CLI merges a dependency tree by name, so a Coral `select` and
  shadcn's `select` would be taken for the same item and one of them dropped, files and all.
- **Every file is `registry:component`**, with `target` mirroring its path under `coral/`. The CLI
  resolves that type against the consumer's `components` alias, which puts Coral in
  `$lib/components/coral/` beside shadcn's `ui/` - the shape this repo keeps - and follows the
  alias if a project moved it.
- **Tests are not published.** They are written against this workspace's setup.
- **Imports between Coral files stay relative.** The CLI rewrites `$lib/*` to the consumer's
  aliases but leaves relative paths alone, which is what lets the installed folder work whatever
  those aliases are.
- **The publish URL lives in `registry.config.js`**, read by the generator and by the docs site's
  install block. Changing where Coral is served is changing that one constant.
- **`pnpm --filter coral smoke`** is the end-to-end proof: it serves the built registry, installs
  every item into a throwaway SvelteKit project and type-checks the result. Run it when anything
  in `scripts/`, the aliases or the manifest shape changes. It takes a few minutes and needs the
  network.

## Formatting

Tabs, single quotes, no trailing commas, 100 cols: enforced by Prettier, don't fight it. Tailwind
classes are auto-sorted; don't hand-order them.

## Commands

From the repo root, which delegates to the workspace that owns the task:

```sh
pnpm dev        # docs site
pnpm check      # type-check both workspaces
pnpm lint       # prettier --check + eslint, whole repo, one config
pnpm format     # prettier --write
pnpm test       # vitest in every workspace that has tests
pnpm registry   # rebuild the registry into apps/docs/static/r
pnpm build      # production build of the site (runs the registry build first)
```

Per workspace when that is what you mean: `pnpm --filter coral test`,
`pnpm --filter coral smoke`, `pnpm --filter coral-docs dev`.

`pnpm dlx shadcn-svelte@latest add <component>` **from `packages/coral`** to add a new shadcn
primitive - that is where `components.json` and the one `ui/` folder live.

## Before considering something done

```sh
pnpm lint
pnpm check
pnpm test
```

Run them for real, read the output.

Expect **0 errors** in both workspaces. Anything reported is yours - there is no longer a baseline
of known failures to read past.

A `check` that printed no `COMPLETED` line did not type-check anything, so read the output rather
than the exit code alone.

> ⚠️ **Build output poisons both scripts, so `build` and `check` delete it first.** `vite build`
> writes a bundled worker to `.svelte-kit/cloudflare/` plus `.svelte-kit/output/`, and that breaks
> two things at once:
>
> - `svelte-check` discovers files by walking the workspace: it ignores tsconfig `exclude`, and
>   its own `--ignore` flag refuses to run alongside `--tsconfig`, so it type-checks the generated
>   worker and reports ~900 errors nobody wrote.
> - `wrangler types` emits a `GlobalProps.mainModule` block **only when that worker exists**, so
>   `wrangler types --check` passes on a clean tree and fails on a dirty one. Cloudflare restores a
>   build-output cache between runs, which made CI fail on every build after the first.
>
> Consequence to respect: **run `check` before `build`, never after**. It deletes the artifact you
> were about to deploy. And run `pnpm gen` on a clean tree, or you commit a
> `worker-configuration.d.ts` that references build output and breaks CI.

> ⚠️ `worker-configuration.d.ts` declares a global `Element` whose HTMLRewriter `append`/`prepend`
> signatures merge with (and shadow) the DOM ones, and typing `App.Platform` is what pulls it into
> the program. `apps/docs/src/app.d.ts` therefore leaves `Platform` undeclared - the site is
> prerendered and never reads it - and `tsconfig.json` does not list those types. Declaring either
> again brings back the shadowing, and with it shadcn's `ui/native-select` reporting an error
> nobody can fix.

> ⚠️ `mod` in a `kit/shortcut` combo resolves to Cmd on a Mac and Ctrl everywhere else, from the
> real browser via `detectPlatform()`. A test that presses Control against a `mod+k` binding passes
> in CI and fails on a Mac. Spell `ctrl` or `meta` explicitly in test fixtures.

> ⚠️ The site deploys through **Cloudflare Workers Builds**, configured in the dashboard with root
> directory `/` and three commands, all root scripts: build `pnpm run build`, deploy
> `pnpm run worker:deploy`, version `pnpm run worker:version`. The last two run the docs
> workspace's own wrangler from `apps/docs`, where `wrangler.jsonc` lives - a bare
> `npx wrangler deploy` from the root finds no config. Keeping the dashboard pointed at root
> scripts means a move of the docs app is a change to `package.json`, not to the dashboard.
> The build image defaults to **pnpm 10.11.1** and does not read `packageManager`; the override
> is a `PNPM_VERSION` build variable.

> ⚠️ The registry the site serves is **built, not committed**: `apps/docs/static/r/` is generated by
> `apps/docs`'s `build` script before `vite build`. A deploy that skips that script deploys a site
> whose install commands 404.

Then re-check the **Coral test**:

1. **Written twice already?** → If not, it doesn't enter yet.
2. **Does it define appearance?** → If so, it doesn't belong in Coral.
3. **Does it know your app's domain?** → If so, it belongs in the project's `features/`.
4. **Does the API match the component's nature?** → Flat props only if there's a canonical case;
   otherwise composition.
5. **Does the rare case force abandoning Coral?** → If so, expose the pieces.
