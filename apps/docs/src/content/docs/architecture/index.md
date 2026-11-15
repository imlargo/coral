---
title: Architecture
description: One folder in four layers, importing in one direction, with three things it reaches for outside itself.
group: Concepts
---

Coral is one self-contained folder, `coral/`, installed beside shadcn-svelte's `ui/`. Inside it,
code is split by how much it knows: shared modules at the bottom, generic components above them,
then compositions for one use case, then components that speak one product vertical.

## Layers

| Layer      | Knows                                                       | Imports                     | Admission                   |
| ---------- | ----------------------------------------------------------- | --------------------------- | --------------------------- |
| `lib/`     | one concern shared by components: options, focus, debounce  | other `lib/`                | a second component needs it |
| `kit/`     | how one control behaves                                     | `ui/`, `lib/`, other `kit/` | written twice in production |
| `blocks/`  | how several controls work together for one use case         | `kit/`                      | written three times         |
| `product/` | one vertical's shared vocabulary: a message, a plan, a seat | `blocks/`, `kit/`           | written three times         |

Imports only go down the table. A `kit/` component never imports a block, `lib/` never imports a
component, and nothing in Coral imports your project. `blocks/` and `product/` are empty today; the
layers exist so the first entry in each has rules to follow.

## Outside the folder

Coral reaches for exactly three things that are not its own:

- **`#lib/components/ui/*`**: the shadcn-svelte primitives, guaranteed by your `components.json`.
- **`#lib/utils`**: `cn`, written by `shadcn-svelte init`.
- **`@lucide/svelte`**: icons, mapped to your `iconLibrary` on install.

Never the headless library underneath (`bits-ui`): a type it owns is derived from the shadcn
component instead, as `ComponentProps<typeof Avatar>`. Never SvelteKit (`$app/*`, `$env/*`), so a
plain Svelte + Vite project can use every component. Never your types.

The CLI rewrites the first two to your aliases on install. Between Coral's own files, imports are
relative, which is what lets the folder work wherever it lands.

## Folder layout

```
src/lib/components/coral/     ← beside shadcn's ui/
├─ coral.json      → manifest: title, description, version + required primitives
├─ kit/            → composed, generic components - the product
│  └─ avatar/
│     ├─ avatar.svelte
│     ├─ types.ts
│     └─ initials.ts
├─ blocks/         → compositions of the above, one per use case
├─ product/        → components that speak one vertical
│  └─ <vertical>/<name>/
└─ lib/            → shared across components
   ├─ options.ts   → Option<T>, OptionGroup<T>, and reading either shape
   ├─ intl.ts      → collators and formatters, built once
   └─ trigger.ts   → the id and aria-* a button trigger takes
```

**Folders are created when something needs them, never in advance.** A util with a single consumer
stays inside its component's folder and moves to `lib/` the day a second component needs it, which
is exactly how `lib/options.ts` came to be, when `select` became the second component to speak
`Option<T>`.

Moving a file is a breaking change: filenames are public API, so the component that gave the util
up gets a major bump, even though its props did not change.

## What a block is

`kit/` resolves the behaviour of one control. `blocks/` resolves the wiring _between_ several of
them, for one use case: the pipeline a list screen runs, the order things happen in, which state is
shared. A block that only arranges components on a page is a layout, and layouts are yours.

Five rules, so the layer stays a library rather than a folder of templates:

1. **It composes two or more `kit/` components** and earns its keep on what it wires, not on what it
   arranges.
2. **Still no appearance, still no entities.** A block is shaped by a use case, not by a domain:
   "a table with the screen around it", never "an invoices table".
3. **It takes data and callbacks.** No fetching, no routing, no knowledge of your data layer. Where
   a block needs to reach outside itself, it takes a snippet or a handler - a table-with-toolbar
   block would take its rows and hand back what was selected, never fetch them itself.
4. **It may carry copy, with English defaults.** A block has more to say than a control does, and a
   skeleton that has to be filled in entirely is not worth installing. Every string is a prop.
5. **Rule of three.** A component enters `kit/` after the same pattern has been written twice; a
   block waits for three, because the wiring is what varies most between projects.

Blocks are published like anything else: `blocks/<name>/`, an entry in `coral.json`, a page under
`docs/blocks/`, and a registry item named `blocks-<name>` that pulls in the `kit/` items it
composes.

## What a product component is

`kit/` and `blocks/` know no domain. `product/` is the one layer that does: it holds what every
product in a vertical writes - an AI product's streaming message and model picker, a SaaS product's
plan and seat controls, a fintech's amount and transaction rows - and that no generic component can
be, because it speaks that vertical's vocabulary.

Five rules, close to the block ones:

1. **It speaks a vertical, never an app.** The vocabulary is the one every product in the vertical
   shares: a message, a model, a plan, a seat, a transaction. One company's entities, ids and
   business rules still belong in that company's `features/`.
2. **Still no appearance.**
3. **It takes data and callbacks.** No fetching, no routing, and no provider SDK: an AI component
   takes the stream it renders, a billing one takes the plans and the handler that changes them. The
   project decides which provider sits behind it.
4. **It may carry copy, with English defaults**, every string a prop.
5. **Rule of three**, as for blocks.

Entries are grouped by vertical, one folder deeper: `product/<vertical>/<name>/`, a page under
`docs/product/<vertical>/`, and a registry item named `product-<vertical>-<name>`. It may build on
`blocks/`, `kit/` and the shadcn primitives; nothing below it imports it.

## API shape

There is no mandatory form; the interface follows the component's nature.

**Flat props** when a defensible canonical case exists and customization is marginal: an avatar,
a gauge, a copy button.

**Composition**, with sub-components and shared state through context, when the parts vary
independently and there is no normal case: a responsive dialog, a stepper.

**When in doubt, composition.** A flat API that falls short forces a rewrite and breaks everyone
using it. A verbose composition only asks for a shortcut on top, and breaks nothing.

Either way, every composed component exposes its pieces. If a rare case means abandoning Coral and
rebuilding from raw shadcn, the component failed.
