# Coral 🪸

**An ergonomics layer on top of [shadcn-svelte](https://www.shadcn-svelte.com/). No styles of its own. Copied into your project, not installed as a dependency.**

> Coral turns forty lines of composition into a single tag - without taking away your ability to
> recompose when you need to.

[**Documentation & live demos →**](https://coral.imlargo.dev/docs) · MIT · Svelte 5 · Tailwind v4

---

shadcn-svelte gives you primitives. Coral gives you the compositions you were going to write on top
of them anyway - a combobox whose search ignores accents, a date picker with ranges and presets, a
confirm dialog that waits on the request and stays open when it fails, a tags input with real
keyboard handling.

It is **not** a design system, not a fork of shadcn, not a primitives library, and not an npm
package. It is a folder you copy, and from that moment it is yours.

```svelte
<script lang="ts">
	import Combobox from '$lib/coral/kit/combobox/combobox.svelte';

	const cities = [
		{ value: 11001, label: 'Bogotá' },
		{ value: 5001, label: 'Medellín' }
	];

	let city = $state<number>();
</script>

<!-- Typing `bogota` finds `Bogotá`. Focus returns to the trigger on select. -->
<Combobox options={cities} bind:value={city} placeholder="Select a city..." clearable />
```

The equivalent in raw shadcn-svelte is a popover, a command menu, a `triggerRef`, a
`closeAndFocusTrigger`, and roughly fifty lines of markup - which shadcn's own docs are explicit
about, describing it as a recipe rather than a component.

---

## Built in public

Coral started as one studio's internal library and is now open source. The rule that shaped it has
not changed and will not: **a component is extracted, never speculated.** Nothing enters Coral until
the same pattern has already been written at least twice in real production work. It grows the way a
reef does - by sedimentation - which is why there are ten components and not eighty.

You are welcome to use it, copy it, fork it, and open issues. What that rule means in practice for
contributions is in [Contributing](#contributing).

**Status: growing, and honest about it.** The ten components below are used in production and their
APIs are settled enough to version. Everything is `0.x` at the repo level; individual components
carry their own version in [`coral.json`](./src/lib/coral/coral.json) and follow semver, so a
breaking change to one is visible without reading a diff.

---

## Install

### Requirements

A SvelteKit project on **Svelte 5**, already initialized with shadcn-svelte - meaning it has a
`components.json`, a `src/lib/components/ui/` folder, and `src/lib/utils.ts` exporting `cn`:

```bash
pnpm dlx shadcn-svelte@latest init
```

Those two paths plus `@lucide/svelte` are the only things Coral reaches for outside its own folder,
and all three come with any shadcn-svelte setup - the paths from the aliases in `components.json`,
the icons from its `iconLibrary`. That is what makes the folder portable.

### 1. Copy the folder

```bash
npx degit imlargo/coral/src/lib/coral src/lib/coral
```

Take the whole folder, or just the component directories you want plus `lib/` - each `kit/*` folder
is self-contained apart from what `lib/` holds.

### 2. Install the primitives it declares

Every component lists the shadcn primitives it imports in
[`src/lib/coral/coral.json`](./src/lib/coral/coral.json):

```json
{
	"kit/combobox": {
		"version": "4.1.0",
		"shadcn": ["popover", "command", "button", "badge"],
		"npm": ["@lucide/svelte"]
	}
}
```

```bash
pnpm dlx shadcn-svelte@latest add popover command button badge
```

Only what a component **imports** is listed - primitives those primitives need in turn are the CLI's
job. Entries under `npm` are real dependencies for `package.json`; `@lucide/svelte` is already there
in any project whose `components.json` sets `"iconLibrary": "lucide"`, which is the default.

### 3. Import by file path

There are no barrels. One component, one folder, imported directly:

```ts
import Combobox from '$lib/coral/kit/combobox/combobox.svelte';
```

That makes filenames public API: renaming one is a breaking change, and gets a major bump.

> **Coming: one-command install.** shadcn-svelte can add components straight from a custom registry,
> which is exactly the right shape for Coral - still copied into your project, still yours, but with
> the primitives resolved for you. Publishing `https://coral.imlargo.dev/r/*` so that
> `pnpm dlx shadcn-svelte@latest add https://coral.imlargo.dev/r/combobox.json` just works is the
> next milestone. Until then, the two steps above are the install.

---

## Components

Ten so far. Each links to its full API, props table and live demos - and to what it actually
resolves for you, which is the point rather than the shorter markup.

- **[activity-calendar](https://coral.imlargo.dev/docs/kit/activity-calendar)** - a year of daily
  counts as a grid of squares. Timezone-correct day buckets, quantile scaling that survives
  long-tailed data, one tab stop with arrow-key navigation, one shared tooltip instead of 365.
- **[avatar](https://coral.imlargo.dev/docs/kit/avatar)** - image with an initials fallback. An
  accessible name that does not change when the photo 404s, and never doubles up.
- **[combobox](https://coral.imlargo.dev/docs/kit/combobox)** - a select with a search box.
  Accent-insensitive search, focus returned to the trigger, single or multiple, server-side search
  with debounce.
- **[confirm-dialog](https://coral.imlargo.dev/docs/kit/confirm-dialog)** - "are you sure?", on
  `alert-dialog` so an outside click cannot dismiss a destructive action. Waits on an async
  `onconfirm`, stays open on failure, blocks double-submit.
- **[date-picker](https://coral.imlargo.dev/docs/kit/date-picker)** - popover, calendar and
  formatted trigger, single day or range. Closes on range completion rather than first click;
  DST-safe day handling.
- **[file-input](https://coral.imlargo.dev/docs/kit/file-input)** - click or drop, validate, show
  what was picked. Keyboard-operable, drag-and-drop that survives child elements, de-duplicates a
  file dropped twice.
- **[number-input](https://coral.imlargo.dev/docs/kit/number-input)** - bounds that hold from the
  steppers _and_ from typing, exact decimal arithmetic, no silent wheel-scroll edits.
- **[rating-group](https://coral.imlargo.dev/docs/kit/rating-group)** - stars on native radios, so
  keyboard and form semantics come from the platform. Half fills from one glyph; `readonly` reads as
  an image, not a disabled control.
- **[select](https://coral.imlargo.dev/docs/kit/select)** - a self-deriving trigger label, a `value`
  that keeps its own type instead of bits-ui's string keys, and an `onchange` that only fires on
  real user changes.
- **[tags-input](https://coral.imlargo.dev/docs/kit/tags-input)** - one delimiter rule for typed and
  pasted alike, full keyboard handling, and it reports _why_ a tag was rejected.

Each one's version and the shadcn primitives it needs are recorded in
[`coral.json`](./src/lib/coral/coral.json) - the manifest the install step reads, and the only place
they are written down.

`kit/select`, `kit/combobox` and `kit/date-picker` share `lib/`, which holds the `Option<T>`
vocabulary and the clipped field that makes `name`, `form` and `required` work on a control the
browser cannot validate on its own.

---

## Localization

Coral was extracted from Spanish-language products, and that shows in two different ways:

**Configurable.** `activity-calendar`, `date-picker` and `rating-group` take a `locale` prop that
defaults to `es-CO`. Pass your own and every date, weekday and number follows it.

**Hardcoded, for now.** Three helpers still assume `es-CO`: accent folding in combobox search
(`kit/combobox/fold.ts`), byte formatting in the file input (`kit/file-input/format-bytes.ts`), and
initials casing in the avatar (`kit/avatar/initials.ts`). They are correct for most Latin-script
locales and wrong for none that Coral has been used in - but they are not yours to configure yet.
Making locale configurable throughout is on the roadmap below. Since you own the copied folder,
changing the three string literals is also a perfectly good answer today.

---

## Architecture

Coral is a **single self-contained folder**. Installing it is copying `src/lib/coral/` across;
nothing else in this repo travels.

```
src/lib/
├─ components/ui/   → shadcn-svelte (owned by your project - Coral does NOT touch it)
├─ utils.ts         → cn (shadcn's)
├─ docs/            → this repo's own documentation site - not copied
└─ coral/           → 📦 the folder that gets copied
   ├─ coral.json    → manifest: version + required primitives per component
   ├─ lib/          → shared across components (options.ts, hidden-field.svelte)
   └─ kit/          → composed, generic components - the actual product
      ├─ activity-calendar/
      ├─ avatar/
      └─ …
```

`blocks/` (app-level compositions, rule of 3) and `hooks/` appear the day a component actually needs
them. A util with one consumer stays inside its component's folder until a second one needs it -
which is exactly how `lib/options.ts` came to be, when `select` became the second component to speak
`Option<T>`, and how `lib/hidden-field.svelte` did when a third needed to submit a value from a
control that is not an input.

**Import contract (critical rule):** Coral only imports from `$lib/components/ui/*`, `$lib/utils`
(`cn`), `@lucide/svelte`, and other Coral files. Never directly from a headless library (`bits-ui`),
never from project domain types.

```ts
// ✅ inside Coral
import { Avatar } from '$lib/components/ui/avatar/index.js';

// ✅ from your project, consuming Coral - by file path, no barrels
import Avatar from '$lib/coral/kit/avatar/avatar.svelte';

// ❌
import { Avatar } from 'bits-ui';
import type { Invoice } from '$lib/types';
```

Need a type the headless library owns? Derive it from the shadcn component instead:
`ComponentProps<typeof Avatar>`.

---

## The three boundaries

**No appearance.** No colors, typography, shadows or radii - only layout utilities (`flex`, `gap-*`,
`w-full`). Everything visual comes from _your_ shadcn theme, which is why Coral drops into any
project without bringing a look with it. A component that hardcodes a size or a color has failed.

**No domain.** No `Invoice`, no `Student`, no `Contract`. Domain lives in your `features/`.

**One-way imports.** `blocks/` composes `kit/`, `kit/` composes shadcn primitives and other `kit/`.
Never the reverse. And nothing is duplicated: two components needing the same logic means extracting
a third, or `lib/`.

### What earns a place

Composition has to earn its keep. What Coral contributes is **resolved behavior** - filtering,
keyboard navigation, shared state through context, accessibility, debounce, loading and empty states

- not syntactic sugar. A composed component that only saves typing does not belong here.

Every composed component exposes its pieces. If a rare case forces you to drop Coral and rebuild
from raw shadcn, the component failed.

---

## Contributing

Issues, bug reports and questions are welcome from anyone.

New components are held to the extraction rule, and it applies to contributors exactly as it applies
to the maintainer: **show where you already wrote it twice.** A PR adding a component is a PR that
names two real projects where the same pattern was written by hand, and says what was painful about
it. That is not gatekeeping for its own sake - it is the only thing keeping Coral from becoming the
eighty-component library nobody trusts.

Good contributions that need no such justification: bug fixes, accessibility fixes, tests,
documentation, and making something configurable that is currently hardcoded.

Before opening a PR, read [`AGENTS.md`](./AGENTS.md) - the mandatory rules, the import contract, the
conventions and the checklist - and make sure these pass:

```sh
pnpm lint     # prettier + eslint
pnpm check    # expected: exactly 1 error, shadcn's untouchable ui/native-select
pnpm test     # vitest
```

---

## Development

```sh
pnpm install
pnpm dev      # docs site + live demos at /docs
pnpm test     # vitest, run once
pnpm format   # prettier --write
pnpm build    # production build - run `pnpm check` FIRST, build deletes its own output
```

This repo doubles as Coral's documentation site (`src/routes/docs/`): one Markdown page per
component, with live sandboxed previews whose source is read from the demo file at build time - so a
snippet shown can never drift from what is actually running. Search and a "Copy Page" button (raw
Markdown, for pasting into an LLM) come with it.

To add a shadcn primitive: `pnpm dlx shadcn-svelte@latest add <component>`.

---

## Roadmap

Ordered by rewrite cost × frequency, not by what is fun to build:

1. **shadcn-svelte registry** - one-command install, described above
2. **Configurable locale throughout** - the three hardcoded helpers under [Localization](#localization)
3. **Component tests** - the pure logic is well covered; the interaction layer (focus, keyboard,
   drag) is only starting to be
4. **DataTable** - sorting, filtering, pagination, empty state. Highest cost per project; was
   prototyped once and pulled back out until it has been written twice for real
5. **Form field + validation**
6. **Empty states and skeletons** - shadcn ships the primitives; nothing in `kit/` composes them yet
7. **App shell** and **generic CRUD page** - `blocks/`, waiting on the rule of 3

---

## License

[MIT](./LICENSE) © Juan Carlos Largo
