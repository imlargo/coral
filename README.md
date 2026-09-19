# Coral 🪸

> A component library for shadcn-svelte. Copied into your project, not installed as a dependency.

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)
[![Svelte](https://img.shields.io/badge/svelte-5-FF3E00)](https://svelte.dev)
[![Tailwind](https://img.shields.io/badge/tailwind-v4-38BDF8)](https://tailwindcss.com)

[**Documentation & live demos →**](https://coral.imlargo.dev/docs)

- shadcn-svelte gives you primitives. Coral gives you the compositions you were going to write on
  top of them anyway - a combobox whose search ignores accents, a date picker with ranges and
  presets, a confirm dialog that waits on the request and stays open when it fails.
- **Copied, not installed.** `npx degit` drops the folder into your project; from then it's your
  code, versioned like the rest of your codebase, with no npm dependency to fall behind.
- **Extraction only, never speculation.** A component enters only after the same pattern has been
  written twice in real production work. Twenty-three components exist, not eighty.
- **No appearance of its own.** No colors, shadows, radii or typography - only layout utilities.
  Everything visual comes from _your_ shadcn theme.
- Every component's version and required shadcn primitives are recorded in
  [`coral.json`](./src/lib/coral/coral.json), and follow semver independently.

## Behavior

The table below is what Coral actually resolves, case by case - which matters more for deciding
whether you need it than a list of props would:

| Case                                 | Hand-rolled with shadcn-svelte / bits-ui                | Coral                                                     |
| ------------------------------------ | ------------------------------------------------------- | --------------------------------------------------------- |
| Combobox search                      | exact substring, case- and accent-sensitive             | folds accents - `acai` finds `Açaí`                       |
| Combobox, after selecting an option  | focus is lost to the body                               | returns to the trigger                                    |
| Confirm dialog when the action fails | you wire the re-open and the pending state per instance | stays open, blocks double-submit, one prop                |
| Date range picker                    | closes on the first click, mid-range                    | closes only once the range is complete                    |
| Avatar with a broken image URL       | a blank box, or fallback logic written per instance     | initials fallback; the accessible name never doubles      |
| A file dropped on the input twice    | added twice, unless you de-dupe yourself                | de-duplicated                                             |
| Number input via the mouse wheel     | can silently push the value out of bounds               | bounds hold from steppers, typing and the wheel alike     |
| A select's bound value               | bits-ui's own string keys                               | keeps the type you gave it - a number, a union, an object |
| Tags typed vs. pasted                | two code paths, two rules to keep in sync               | one delimiter rule for both                               |
| Escape in a search inside a dialog   | closes the dialog along with the term                   | first Escape clears the term, the second is the dialog's  |
| Password shown when the form submits | the password manager never offers to save it            | back to `type="password"` before the form is read         |
| Copy button on plain `http`          | throws, or shows a check mark for nothing               | falls back, and reports a failure as a failure            |
| Reordering a list on a phone         | HTML5 drag-and-drop fires nothing on touch              | pointer events for touch, plus a full keyboard path       |
| "5 minutes ago" on a page left open  | stale, or an interval per timestamp every second        | each label wakes only when its own text changes           |

Every row is one line of a fuller story - the full reasoning, the edge cases and a live demo are
on each component's own page, linked under [Components](#components).

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
		"version": "4.2.0",
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

```svelte
<script lang="ts">
	import Combobox from '$lib/coral/kit/combobox/combobox.svelte';

	const fruits = [
		{ value: 1, label: 'Açaí' },
		{ value: 2, label: 'Guava' }
	];

	let fruit = $state<number>();
</script>

<Combobox options={fruits} bind:value={fruit} placeholder="Select a fruit..." clearable />
```

That makes filenames public API: renaming one is a breaking change, and gets a major bump.

> **Coming: one-command install.** shadcn-svelte can add components straight from a custom registry,
> which is exactly the right shape for Coral - still copied into your project, still yours, but with
> the primitives resolved for you. Publishing `https://coral.imlargo.dev/r/*` so that
> `pnpm dlx shadcn-svelte@latest add https://coral.imlargo.dev/r/combobox.json` just works is the
> next milestone. Until then, the three steps above are the install.

## Components

Twenty-three so far. Each links to its full API, props table and live demos:

- **[action-button](https://coral.imlargo.dev/docs/kit/action-button)** - a button that waits on
  its own async `onclick`. One click, one request; busy without dropping keyboard focus; the same
  `false`-or-throw failure convention as confirm-dialog.
- **[activity-calendar](https://coral.imlargo.dev/docs/kit/activity-calendar)** - a year of daily
  counts as a grid of squares. Timezone-correct day buckets, quantile scaling that survives
  long-tailed data, one tab stop with arrow-key navigation, one shared tooltip instead of 365.
- **[avatar](https://coral.imlargo.dev/docs/kit/avatar)** - image with an initials fallback. An
  accessible name that does not change when the photo 404s, and never doubles up.
- **[avatar-stack](https://coral.imlargo.dev/docs/kit/avatar-stack)** - overlapping avatars with a
  count for the rest. `max` counts circles including the count, never renders `+1`, and reads as a
  list.
- **[combobox](https://coral.imlargo.dev/docs/kit/combobox)** - a select with a search box.
  Accent-insensitive search, focus returned to the trigger, single or multiple, server-side search
  with debounce.
- **[confirm-dialog](https://coral.imlargo.dev/docs/kit/confirm-dialog)** - "are you sure?", on
  `alert-dialog` so an outside click cannot dismiss a destructive action. Waits on an async
  `onconfirm`, stays open on failure, blocks double-submit.
- **[copy-button](https://coral.imlargo.dev/docs/kit/copy-button)** - copies text, announces it to
  screen readers, falls back where the Clipboard API is missing, and treats failure as a state.
- **[date-picker](https://coral.imlargo.dev/docs/kit/date-picker)** - popover, calendar and
  formatted trigger, single day or range. Closes on range completion rather than first click;
  DST-safe day handling.
- **[file-input](https://coral.imlargo.dev/docs/kit/file-input)** - click or drop, validate, show
  what was picked. Keyboard-operable, drag-and-drop that survives child elements, de-duplicates a
  file dropped twice.
- **[inline-edit](https://coral.imlargo.dev/docs/kit/inline-edit)** - rename in place. Keyboard
  reachable, Enter saves, Escape cancels without closing the dialog, an async save that fails keeps
  what was typed.
- **[number-input](https://coral.imlargo.dev/docs/kit/number-input)** - bounds that hold from the
  steppers _and_ from typing, exact decimal arithmetic, no silent wheel-scroll edits.
- **[password-input](https://coral.imlargo.dev/docs/kit/password-input)** - a visibility toggle
  that keeps the caret, hides the password again on submit so password managers still work, and
  warns about Caps Lock.
- **[rating-group](https://coral.imlargo.dev/docs/kit/rating-group)** - stars on native radios, so
  keyboard and form semantics come from the platform. Half fills from one glyph; `readonly` reads as
  an image, not a disabled control.
- **[relative-time](https://coral.imlargo.dev/docs/kit/relative-time)** - "hace 5 minutos" in a
  `<time>`, worded by `Intl`, kept current by one timeout set for the moment its text changes.
- **[reorder-list](https://coral.imlargo.dev/docs/kit/reorder-list)** - drag to reorder with mouse,
  touch or keyboard, announced, and written once per drop rather than once per row crossed.
- **[responsive-dialog](https://coral.imlargo.dev/docs/kit/responsive-dialog)** - a dialog on wide
  screens and a drawer on narrow ones, composed once, and still open after crossing the breakpoint.
- **[search-input](https://coral.imlargo.dev/docs/kit/search-input)** - debounced, deduplicated
  `onsearch`, a minimum length that clears instead of freezing results, and an Escape that does not
  close the dialog around it.
- **[select](https://coral.imlargo.dev/docs/kit/select)** - a self-deriving trigger label, a `value`
  that keeps its own type instead of bits-ui's string keys, and an `onchange` that only fires on
  real user changes.
- **[shortcut](https://coral.imlargo.dev/docs/kit/shortcut)** - draws `mod+k` as `⌘K` or `Ctrl K`
  by platform and binds it: exact, layout-aware matching that stays out of text fields.
- **[show-more](https://coral.imlargo.dev/docs/kit/show-more)** - clamps content to a few lines
  and only offers to expand when it actually overflows; focus never lands in the clipped part.
- **[stepper](https://coral.imlargo.dev/docs/kit/stepper)** - multi-step flows. Async validation
  on Next, linear by completion rather than position, focus moved to the new step.
- **[tags-input](https://coral.imlargo.dev/docs/kit/tags-input)** - one delimiter rule for typed and
  pasted alike, full keyboard handling, and it reports _why_ a tag was rejected.
- **[tree-view](https://coral.imlargo.dev/docs/kit/tree-view)** - the WAI-ARIA tree pattern from a
  plain array: one tab stop, the full arrow-key model, typeahead, children loaded on demand.

Each one's version and the shadcn primitives it needs are recorded in
[`coral.json`](./src/lib/coral/coral.json) - the manifest the install step reads, and the only place
they are written down.

`kit/select`, `kit/combobox` and `kit/date-picker` share `lib/`, which holds the `Option<T>`
vocabulary and the clipped field that makes `name`, `form` and `required` work on a control the
browser cannot validate on its own.

`lib/` also holds `debounce`, shared by combobox and search-input, and `action` - the pending flag,
the double-submit guard and the `false`-or-throw convention - read by every component that waits on
a request: confirm-dialog, action-button, inline-edit and stepper. `kit/avatar-stack` composes
`kit/avatar`, so copy both.

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

Three rules keep that folder worth copying into anything:

**No appearance.** No colors, typography, shadows or radii - only layout utilities (`flex`, `gap-*`,
`w-full`). Everything visual comes from _your_ shadcn theme, which is why Coral drops into any
project without bringing a look with it. A component that hardcodes a size or a color has failed.
Enforced at the import level: Coral only ever imports from `$lib/components/ui/*`, `$lib/utils`
(`cn`), `@lucide/svelte`, and other Coral files - never a headless library directly, never your
project's own domain types.

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

**No domain.** No `Invoice`, no `Student`, no `Contract`. Domain lives in your `features/`.

**One-way imports.** `blocks/` composes `kit/`, `kit/` composes shadcn primitives and other `kit/`.
Never the reverse. And nothing is duplicated: two components needing the same logic means extracting
a third, or `lib/`.

## Scope

Coral leaves out a layout system, appearance of any kind, and anything that only saves typing.
Each cut is deliberate:

- **No `Components`/layout-substitution map.** Nothing implicitly remaps `h1` or `blockquote` to a
  custom component. Write the component tag where you want it used.
- **No appearance.** Colors, radii, shadows and typography are your shadcn theme's job, not
  Coral's - see [Architecture](#architecture).
- **No domain knowledge.** No `Invoice`, no `Student`. That lives in your project's `features/`.
- **No syntactic sugar.** A composed component that only saves typing does not belong here. What
  Coral contributes is **resolved behavior** - filtering, keyboard navigation, shared state through
  context, accessibility, debounce, loading and empty states.
- **No DataTable, no form-field/validation layer, yet.** Prototyped and pulled back out until the
  pattern has been written twice for real - see [Roadmap](#roadmap).

The test a feature or component has to pass before it is added, applied the same way to a
contributor's PR as to the maintainer's own idea:

1. Has the same pattern been written twice already, in real production work?
2. Does it define appearance? If so, it does not belong in Coral.
3. Does it know the client's domain? If so, it belongs in the project's `features/`.
4. Does the API match the component's nature - flat props only where there is a defensible
   canonical case, composition otherwise?
5. Does the rare case force abandoning Coral and rebuilding from raw shadcn? If so, the component
   failed - every composed component has to expose its pieces.

## Maintenance

One person maintains this. What bounds the risk if that changes:

- **You already own a working copy.** Coral is copied into your project, not installed as a live
  dependency - nothing you shipped breaks if this repository disappears tomorrow. Forking it is
  copying the one folder you already have.
- **No hidden runtime.** Twenty-three components, no framework of their own underneath - shadcn-svelte and
  bits-ui, which this repository doesn't maintain, do the actual work.
- **Versioned per component.** Each entry in [`coral.json`](./src/lib/coral/coral.json) carries its
  own semver, so a breaking change to one is visible without reading a diff, and doesn't force a
  repo-wide version bump.
- **MIT.** No license ambiguity for a folder you're about to make part of your own codebase.

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

## Contributing

Issues, bug reports and questions are welcome from anyone.

New components are held to the extraction rule from [Scope](#scope), and it applies to
contributors exactly as it applies to the maintainer: **show where you already wrote it twice.** A
PR adding a component is a PR that names two real projects where the same pattern was written by
hand, and says what was painful about it. That is not gatekeeping for its own sake - it is the
only thing keeping Coral from becoming the eighty-component library nobody trusts.

Good contributions that need no such justification: bug fixes, accessibility fixes, tests,
documentation, and making something configurable that is currently hardcoded.

Before opening a PR, read [`AGENTS.md`](./AGENTS.md) - the mandatory rules, the import contract, the
conventions and the checklist - and make sure these pass:

```sh
pnpm lint     # prettier + eslint
pnpm check    # expected: exactly 1 error, shadcn's untouchable ui/native-select
pnpm test     # vitest
```

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

## License

[MIT](./LICENSE) © Juan Carlos Largo
