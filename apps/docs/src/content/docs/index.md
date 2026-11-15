---
title: Introduction
description: An ergonomics layer on top of shadcn-svelte, installed into the project as source it owns.
group: Getting started
---

shadcn-svelte gives a project primitives: a popover, a command menu, a calendar, a dialog. Coral
gives it the components every product then builds out of them: a combobox whose search finds
`Açaí` when someone types `acai`, a date picker that waits for the end of a range before closing, a
confirm dialog that waits on the request and stays open when it fails.

Each one is installed with the shadcn-svelte CLI you already use, lands in your project as source
next to shadcn's `ui/`, and from then on is your code.

## What Coral is

- **A registry of components, not a package.** There is no `coral` dependency in your
  `package.json`. `shadcn-svelte add` copies a component's files into
  `src/lib/components/coral/`, with the primitives and shared modules it needs.
- **Behavior, not appearance.** Coral writes no colors, radii, shadows or type sizes. It composes
  shadcn primitives and draws everything else with your theme's tokens, so it looks like the rest of
  your app because it is styled by the same theme. Try the palette menu in the navbar: every page
  and demo here follows it.
- **Generic.** No component knows about invoices, students or tickets. It takes options, values and
  callbacks, and your `features/` decide what they mean.

## What it resolves

The work Coral takes off your hands is the part that is easy to get wrong and tedious to get right:
filtering that folds accents, keyboard navigation, focus that goes back where it came from,
announcements for screen readers, loading and empty states inside the list, a handler that can fail
without losing what the user typed. [Why Coral](/docs/why-coral) goes through it case by case.

## How it works

1. **Start from shadcn-svelte.** Any project with a `components.json` and the `ui/` folder the
   shadcn-svelte CLI writes is ready. [Installation](/docs/installation) covers SvelteKit and a
   plain Svelte + Vite project.
2. **Add a component.** One command per component, printed on its page for your package manager.
   It brings the primitives the component composes, in your style, and rewrites its imports to your
   aliases.
3. **Own it.** The files are yours to read, edit and commit. Updating is the same command again, a
   decision you make per component. [Ownership and updates](/docs/ownership) explains the trade.

```bash
pnpm dlx shadcn-svelte@latest add https://coral.imlargo.dev/r/kit-combobox.json
```

```svelte
<script lang="ts">
	import Combobox from '#lib/components/coral/kit/combobox/combobox.svelte';

	const fruits = [
		{ value: 'acai', label: 'Açaí' },
		{ value: 'guava', label: 'Guava' },
		{ value: 'lychee', label: 'Lychee' }
	];

	let fruit = $state<string>();
</script>

<Combobox options={fruits} bind:value={fruit} placeholder="Pick a fruit..." />
```

## The boundaries

Three rules keep the folder safe to drop into any project. They are why Coral can be copied into
yours without bringing a look, a data model or a dependency graph with it.

**No appearance.** Only layout utilities (`flex`, `gap-*`, `w-full`) and, for state no primitive
draws, such as a focus ring or a drag target, the theme's own tokens (`border-ring`, `bg-accent`).
A component that hardcodes a color or a size has failed. [Theming](/docs/theming) shows what that
buys.

**No domain.** Coral knows options, values, files, dates and handlers. What they stand for in your
product lives in your code.

**One-way imports.** A component imports shadcn primitives, other Coral components and Coral's
`lib/`, and nothing else from your project: never the headless library underneath (`bits-ui`),
never your types. [Architecture](/docs/architecture) lays out the layers.

## What earns a place

A component enters Coral only after the same pattern has been written twice in real production
work. What it contributes has to be resolved behavior; a wrapper that only saves typing does not
belong. That is why the catalogue grows slowly, and why each page says what the component handles
for you before it lists a single prop.

Every composed component also exposes its pieces. If a case goes beyond what a component offers,
you drop down to the parts it is made of, or to the shadcn primitive, without starting over.

## Where to go next

- [Components](/docs/components): every component, grouped by what it does.
- [Installation](/docs/installation): requirements and the first component, for SvelteKit or Vite.
- [Conventions](/docs/conventions): the rules every component follows, so one you have not used yet
  behaves like the ones you have.
- [FAQ](/docs/faq): the questions people ask before adopting it.
