---
title: Introduction
description: An ergonomics layer on top of shadcn-svelte, copied into the project as one folder.
---

Coral is Kora's internal component library. It sits on top of shadcn-svelte and does one thing:
remove the code that gets rewritten in every project - the combobox with search, the data table
with sorting and pagination, the form with validation, the confirm dialog - and hand it over
already resolved, without closing the door on taking it apart.

It is not a design system, not a fork of shadcn, not a primitives library, and not an npm package.
It is a folder.

## The three boundaries

**Coral defines no appearance.** No colors, no typography, no shadows, no radii. Everything visual
comes from the project's shadcn theme, so Coral only ever uses layout utilities - `flex`, `gap-*`,
`w-full`. A component that hardcodes a size or a color has already failed.

**Coral knows no domain.** No `Invoice`, no `Student`, no `Contract`. Domain lives in the
consuming project's `features/`.

**Coral imports in one direction only.** `blocks/` composes `kit/`, `kit/` composes shadcn
primitives and other `kit/`. Never the reverse, never the underlying headless library
(`bits-ui`) directly, never project code. And nothing is duplicated: if two components need the
same logic, it gets extracted into a third one or into `lib/`.

## What earns a place

A component enters Coral only after the same pattern has been written **twice** in real, paid
projects. An app-level composition - a `block` - waits for **three**.

What Coral contributes when it composes is resolved behavior, not syntactic sugar: filtering,
keyboard navigation, shared state through context, accessibility, debounce, loading and empty
states. A composed component that only saves typing does not belong here.

Between two possible designs, the one with less API surface wins.

## API shape

There is no mandatory form - the interface is determined by the nature of the component.

**Flat props** when a defensible canonical case exists and customization is marginal: avatar,
badge, skeleton, empty state.

**Composition** with sub-components and shared state through context when the parts vary
independently and there is no real "normal case": combobox, select, data table, complex dialogs.

**When in doubt, composition.** A flat API that falls short forces a rewrite of the component and
breaks everyone already using it. A verbose composition only asks for a shortcut on top, and
breaks nothing.

The acid test: if a special case means abandoning Coral and rebuilding from raw shadcn, Coral
failed. Every component exposes its pieces.
