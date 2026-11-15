---
title: FAQ
description: The questions people ask before adopting Coral, and after.
group: Resources
---

## Is Coral a component library?

It is a set of components, but not a package you depend on. Each one is installed as source into
your project with the shadcn-svelte CLI, and from then on it is your code. There is no `coral`
entry in your `package.json`.

## Why isn't it an npm package?

Because the point is that you can change it. A package fixes the component's behavior and look for
you; a copy lets you read it, step through it and edit it when your product needs something the
component does not do. The cost is that updates are deliberate: see
[Ownership and updates](/docs/ownership).

## Do I need shadcn-svelte?

Yes. Coral composes shadcn-svelte's primitives and is styled by its theme. A project needs a
`components.json`, the `ui/` folder and `cn` in `src/lib/utils.ts`, which `shadcn-svelte init`
writes. [Installation](/docs/installation) covers it.

## Does it work without SvelteKit?

Yes. Coral never imports `$app/*` or `$env/*`, so a plain Svelte + Vite project with shadcn-svelte
set up can use every component. The end-to-end install test in CI runs against SvelteKit.

## Which Svelte and Tailwind versions?

Svelte 5, since every component uses runes, and Tailwind CSS v4, as shadcn-svelte installs it.

## Will it change my shadcn components?

Coral never edits files in `ui/`. Installing a component adds the primitives it uses if they are
missing. Reinstalling with `--overwrite` replaces every file in that component's install tree,
primitives included, so check the diff if you customized one.

## How do I update a component?

Run its install command again with `--overwrite`, then read the diff. The
[changelog](/docs/changelog) lists what each version changed, per component.

## I edited a component. Can I still update it?

Yes, but the update replaces your edit, and the diff is where you put it back. Before editing,
check whether a `class` prop, a snippet, a project default or the component's pieces cover the
change; each page lists them under Customizing.

## How do I change the copy or the language?

Every string a reader sees or hears is a prop with an English default. To set it once for the whole
project, along with the `locale`, call `setCoralDefaults` in your root layout; a prop at a call
site still wins. See [project-wide defaults](/docs/conventions#project-wide-defaults).

## Can I use Coral with a different icon library?

Yes. Coral imports icons from `@lucide/svelte`, and the CLI maps them to the `iconLibrary` your
`components.json` names on install.

## Does it support right-to-left layouts?

Components use logical properties (`ms-*`, `ps-*`, `start-*`) for spacing and alignment, so they
mirror with the page. Where direction carries meaning, such as a gauge's arc, the component follows
the page's `dir` too.

## Why is a component I need missing?

A component enters Coral only after the same pattern has been written twice in real production
work. Until then, build it in your project's own `features/`. If it keeps coming back across
projects, open an issue describing the problem it solves.

## Can I contribute?

Bug reports, accessibility fixes, tests and documentation are welcome from anyone. A new component
follows the same rule as the maintainer's own: show the two places you already wrote it. Read
[`AGENTS.md`](https://github.com/imlargo/coral/blob/main/AGENTS.md) for the rules every change
follows.

## Is it free to use in commercial products?

Yes. Coral is MIT licensed.
