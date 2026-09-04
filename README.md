# Coral 🪸

**Kora's internal component library. Built on top of [shadcn-svelte](https://www.shadcn-svelte.com/). No styles of its own.**

> Coral is the layer that turns forty lines of composition into a single tag - without taking away your ability to recompose when you need to.

📄 **Working in this repo?** [`AGENTS.md`](./AGENTS.md) holds the mandatory rules - architecture, import contract, conventions, and the checklist before anything is considered done. Read it before adding or modifying a component.

---

## Project status

🌱 **Growing.** The SvelteKit + shadcn-svelte scaffold is ready (`src/lib/components/ui/`), Coral
lives in `src/lib/coral/`, and this repo also serves its own documentation site at `/docs`
(component pages, live previews, search). **11 components extracted so far** - see the table below.
`blocks/` and `hooks/` don't exist yet inside Coral; `lib/` does, holding the one thing two
components already share.

Coral is **never built in the abstract**: a component only gets added once it has already been
written at least twice in a paid Kora project. It grows the way a reef does - by sedimentation of
real work, extracted _during_ paid projects, never as a side project.

---

## What Coral is

Coral is an **ergonomics layer** on top of shadcn-svelte - not a design system, not a fork. It
removes the boilerplate that gets rewritten on every project: a combobox with accent-insensitive
search, a date picker with ranges and presets, a confirm dialog that waits on an async request,
a tags input with real keyboard handling - without closing the door on disassembling it when the
case calls for it.

- **No styles of its own**: all visual appearance comes from the project's shadcn theme.
- **No business domain knowledge**: Coral never knows about invoices, clients, or courses.
- **Copied, not installed**: the code becomes the project's own, not an npm dependency.
- **Localized where it matters**: components that format numbers, dates or text default to
  `es-CO` (`1,5 MB`, not `1.5 MB`; `5 – 9 de ene de 2026`; accent-insensitive search).

### What it actually contributes

The point isn't shorter markup. When you compose with Coral, this is already resolved and you
never wire it again: filtering and search, keyboard navigation, shared state between the pieces
(through context, not hand-passed props), accessibility, debounce, multi-select, loading and
empty states.

That's the real difference between composing with Coral and composing with raw shadcn - and it's
what justifies the library even for the components that have no flat API. A composed component
that only saves typing doesn't belong here.

---

## Architecture

Coral is a **single self-contained folder**. Installing it in a project is copying `src/lib/coral/`
across; nothing else in this repo travels.

```
src/lib/
├─ components/ui/   → shadcn-svelte (owned by the project - Coral does NOT touch it)
├─ utils.ts         → cn (shadcn's)
├─ docs/            → this repo's own documentation site - not part of what gets copied
└─ coral/           → 📦 the folder that gets copied
   ├─ coral.json    → manifest: version + required shadcn primitives per component
   ├─ lib/          → shared across components (options.ts, hidden-field.svelte)
   └─ kit/          → composed, generic components - the actual product
      ├─ activity-calendar/
      ├─ avatar/
      ├─ combobox/
      ├─ confirm-dialog/
      ├─ date-picker/
      ├─ file-input/
      ├─ number-input/
      ├─ rating-group/
      ├─ select/
      └─ tags-input/
```

`blocks/` (app-level compositions, rule of 3) and `hooks/` appear the day a component actually
needs them. A util with one consumer stays inside its component's folder until a second one needs
it - that's exactly how `lib/options.ts` came to be, when `select` became the second component to
speak `Option<T>`, and how `lib/hidden-field.svelte` did when a third component needed to submit a
value from a control that is not an input.

**Import contract (critical rule):** Coral only imports from `$lib/components/ui/*`, `$lib/utils`
(`cn`), `@lucide/svelte` for icons, and other Coral files. All three externals are guaranteed by a
shadcn-svelte project's `components.json` - the first two by its aliases, the third by its
`iconLibrary` - and every icon import is declared under `npm` in `coral.json`. Never directly from a
headless library (`bits-ui`, etc.) or from project domain types.

```ts
// ✅ inside Coral
import { Avatar } from '$lib/components/ui/avatar/index.js';

// ✅ from the project, consuming Coral - by file path, no barrels
import Avatar from '$lib/coral/kit/avatar/avatar.svelte';

// ❌
import { Avatar } from 'bits-ui';
import type { Invoice } from '$lib/types';
```

Need a type the headless library owns? Derive it from the shadcn component instead:
`ComponentProps<typeof Avatar>`.

---

## Components

| Component                                                         | Version | shadcn primitives                                 |
| ----------------------------------------------------------------- | ------- | ------------------------------------------------- |
| [`kit/activity-calendar`](./src/lib/coral/kit/activity-calendar/) | 1.0.0   | `tooltip`                                         |
| [`kit/avatar`](./src/lib/coral/kit/avatar/)                       | 1.1.0   | `avatar`                                          |
| [`kit/combobox`](./src/lib/coral/kit/combobox/)                   | 4.1.0   | `popover`, `command`, `button`, `badge`           |
| [`kit/confirm-dialog`](./src/lib/coral/kit/confirm-dialog/)       | 1.0.0   | `alert-dialog`, `button`, `spinner`               |
| [`kit/date-picker`](./src/lib/coral/kit/date-picker/)             | 1.1.0   | `popover`, `calendar`, `range-calendar`, `button` |
| [`kit/file-input`](./src/lib/coral/kit/file-input/)               | 1.0.0   | `empty`, `item`, `button`                         |
| [`kit/number-input`](./src/lib/coral/kit/number-input/)           | 1.0.0   | `input-group`, `input`, `button`                  |
| [`kit/rating-group`](./src/lib/coral/kit/rating-group/)           | 1.0.0   | -                                                 |
| [`kit/select`](./src/lib/coral/kit/select/)                       | 2.1.0   | `select`, `button`                                |
| [`kit/tags-input`](./src/lib/coral/kit/tags-input/)               | 1.0.0   | `input-group`, `input`, `badge`, `button`         |

Each component's full API, props table, and live demos live on its docs page (`pnpm dev`, then
`/docs/kit/<name>`) - that's the source of truth, not this file. What follows is what each one is
for and the one or two things Coral actually resolves, not a syntax-sugar summary:

- **`kit/activity-calendar`** - a year of daily counts as a grid of squares (a GitHub contribution
  graph). Resolves timezone-correct day buckets, quantile-based scaling, one tab stop with arrow-key
  navigation, and a single shared tooltip instead of one per day.
- **`kit/avatar`** - an image with an initials fallback, one tag instead of three. Resolves
  `es-CO`-correct initials (`María del Carmen García` → `MG`) and an accessible name that never
  doubles up between the image and the fallback.
- **`kit/combobox`** - a select with a search box. Resolves accent-insensitive search (`bogota`
  finds `Bogotá`) and returning focus to the trigger after a selection.
- **`kit/confirm-dialog`** - "are you sure?", built on `alert-dialog` rather than `dialog` so an
  outside click can't dismiss a destructive action. Resolves waiting on an async `onconfirm`,
  staying open on failure, and blocking a double-submit.
- **`kit/date-picker`** - a popover, a calendar, and a formatted trigger, single day or range.
  Resolves self-closing behavior, range completion (not first click), locale-formatted labels, and
  timezone/DST-safe day handling.
- **`kit/file-input`** - pick files by click or drop, validate them, show what was picked.
  Resolves keyboard operability, working drag-and-drop, `es-CO` byte formatting, and de-duplicating
  a file dropped twice.
- **`kit/number-input`** - a number field with steppers. Resolves bounds that hold both from the
  steppers and from typing, exact decimal arithmetic, and disabling wheel-scroll edits.
- **`kit/rating-group`** - stars you can pick or only read, on native radios. Resolves keyboard
  navigation and form semantics from the platform, RTL support for free, half-star fills from one
  glyph, and a `readonly` mode that reads as an image, not a disabled control.
- **`kit/select`** - a short list of known options. Resolves a self-deriving trigger label, a
  `value` that keeps its original type (not bits-ui's string keys), and an `onchange` that only
  fires on real user changes.
- **`kit/tags-input`** - typed and pasted text turned into tags. Resolves one delimiter rule for
  both typed and pasted input, full keyboard handling (Backspace onto the last tag, arrow
  navigation), and reporting _why_ a tag was rejected.

`kit/select` and `kit/combobox` share `lib/options.ts` for the `Option<T>` / `OptionGroup<T>`
vocabulary; those two and `kit/date-picker` share `lib/hidden-field.svelte`, the clipped field that
makes `name`, `form` and `required` work on a control the browser cannot validate on its own.

---

## Documentation site

This repo doubles as Coral's own docs site (`src/routes/docs/`, `src/lib/docs/`) - not something
that ships with the copied folder, but how the components above are actually documented and
demoed:

- One Markdown page per component (`+page.md`) with live, sandboxed previews per demo
  (`src/routes/docs/kit/<name>/demos/*.svelte`), source read at build time so the snippet shown
  can never drift from what's actually running.
- Search, a "Copy Page" button (copies the page's raw Markdown, for pasting into an LLM), and
  build-time syntax highlighting via `shiki`.
- Content is compiled with `mdsvex`; see [`vite-plugin-coral-docs.js`](./vite-plugin-coral-docs.js)
  for how demo sources are collected at build time.

Run `pnpm dev` and open `/docs` to browse it.

---

## Stack

- **[SvelteKit](https://svelte.dev/docs/kit)** (Svelte 5) - Svelte-first, no multi-framework support for now.
- **[shadcn-svelte](https://www.shadcn-svelte.com/)** - base primitives, managed via `components.json`.
- **[Tailwind CSS v4](https://tailwindcss.com/)** - layout-only classes inside Coral (`flex`, `gap`, `w-full`); never hardcoded color.
- **[bits-ui](https://bits-ui.com/)** - the headless primitives shadcn-svelte wraps; Coral never imports it directly, only through `$lib/components/ui/*`.
- **TypeScript**, **Vitest** (+ `vitest-browser-svelte`), **ESLint** + **Prettier**, **Husky** + **lint-staged**.
- **`mdsvex`** + **`shiki`** - power the docs site's Markdown pages and code highlighting (docs-site only, not part of Coral itself).
- **Cloudflare Workers** (`wrangler`) as the deploy target for the docs/playground site.

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

# tests (vitest, run once)
pnpm test

# production build - run `pnpm check` first; build deletes its own output
pnpm build
```

`pnpm check` is expected to report exactly **1** error - shadcn's `ui/native-select`, untouchable.
Anything else belongs to Coral or the docs site. See [`AGENTS.md`](./AGENTS.md) for why `check`
must run before `build`, never after.

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
| Generic types             | `Option<T = string>`, never a closed/string-only shape                            |
| Versioned header          | `@coral/kit/combobox` + `@version` in every file, plus an entry in `coral.json`   |

Full conventions, the import contract, and versioning in [`AGENTS.md`](./AGENTS.md) and
[`/docs/conventions`](./src/routes/docs/conventions/+page.md).

---

## Extraction roadmap

Ordered by rewrite cost × frequency (not by what's fun to build), updated as things land:

**Done:**

- ~~Combobox with accent-insensitive search~~ ✅ `kit/combobox` 4.1.0
- ~~Select with a self-deriving trigger label~~ ✅ `kit/select` 2.1.0
- ~~Avatar with flat props~~ ✅ `kit/avatar` 1.1.0
- ~~Confirm dialog (async-aware)~~ ✅ `kit/confirm-dialog` 1.0.0
- ~~Date picker (single + range, with presets)~~ ✅ `kit/date-picker` 1.1.0
- ~~File input (click, drag-and-drop, validation)~~ ✅ `kit/file-input` 1.0.0
- ~~Number input (bounds, exact decimal steps)~~ ✅ `kit/number-input` 1.0.0
- ~~Rating group (native radios, half stars)~~ ✅ `kit/rating-group` 1.0.0
- ~~Tags input (typed + pasted, full keyboard handling)~~ ✅ `kit/tags-input` 1.0.0
- ~~Activity calendar (timezone-correct, quantile scale)~~ ✅ `kit/activity-calendar` 1.0.0

**Not yet - waiting on a second real occurrence, or on the rule of 3 for `blocks/`:**

1. DataTable (sorting, filtering, pagination, empty state) - highest cost per project; was
   prototyped once and pulled back out until it's been written twice for real
2. Form field + validation + dynamic form
3. Empty states and skeletons (shadcn ships `ui/empty` and `ui/skeleton`; nothing in `kit/`
   composes them yet)
4. Charts with presets (shadcn ships `ui/chart` on top of `layerchart`; unused by Coral so far)
5. App shell (block) - needs the rule of 3
6. Generic CRUD page (block)

**How the architecture gets validated:** extract a component from the project in flight, use it in
another project the same week, and see whether it survives untouched. If that cycle works -
extract, reuse, don't modify - the architecture holds.

---

## The Coral test

Before adding or changing anything, ask:

1. **Have I already written this twice?** → If not, it doesn't belong yet.
2. **Does this define appearance?** → If so, it doesn't belong in Coral.
3. **Does this know about my client?** → If so, it belongs in the project's `features/`.
4. **Does the interface match the component's nature?** → Flat props only if there's a canonical case; otherwise, composition.
5. **Does the rare case force me to abandon Coral?** → If so, pieces need to be exposed.
