---
title: Ownership and updates
description: What owning the source means once a component is installed - updating, local edits, versions and what happens if Coral stops.
group: Concepts
---

Installing a Coral component copies its files into your repository. Nothing in your
`package.json` points back at Coral, nothing updates on its own, and nothing you shipped depends on
this site or its registry staying online.

## Your copy

The files under `src/lib/components/coral/` are part of your codebase: read them, step through
them, commit them, change them. A component you have not touched stays exactly what was published,
with its version in the header of every file:

```ts
/**
 * @coral/kit/combobox
 * @version 1.3.0
 */
```

That header is how you find out, months later, which version you have.

## Updating

Run the same command with `--overwrite`:

```bash
pnpm dlx shadcn-svelte@latest add https://coral.imlargo.dev/r/kit-combobox.json --overwrite
```

The CLI installs the item again, with everything it depends on, at the current version: the
component's files, the shared `lib/` modules it uses, and the shadcn primitives it composes. With
`--overwrite`, files that already exist are replaced, primitives in `ui/` included, so a primitive
you customized shows up in the diff too. Nothing outside that tree is touched.

Before updating:

1. Read the component's entries in the [changelog](/docs/changelog) above the version your header
   reports. A `Breaking` badge says how to migrate.
2. Commit, so the update arrives as a diff you can read and revert.
3. Run the command, then read `git diff`. If you had edited the component, this is where your edit
   is gone; put it back from the diff, or keep your version of that file.

There is no single Coral version to track. You installed components, and each one is behind or
current on its own.

## Local edits

Editing an installed component is allowed, and sometimes the right call. Three ways to keep the
cost down:

- **Prefer the outside first.** A `class` prop, a snippet, a project default through
  `setCoralDefaults`, or the component's pieces cover most needs without touching its source. Each
  component page lists them under Customizing.
- **Keep the edit small and named.** A comment saying why, at the line that changed, survives the
  next update's diff better than a rewrite.
- **Send it back.** A fix that would help everyone belongs upstream as an issue or pull request, so
  your copy and Coral stop drifting apart.

## Versions

Every component follows semver independently:

- **Patch:** a fix with no change to what you write.
- **Minor:** something new (a prop, a snippet, a behavior) that leaves existing code working.
- **Major:** a change to existing code. Renaming a file is one, because filenames are public API:
  you import components by path, and there are no barrels to absorb a move.

The version lives in [`coral.json`](https://github.com/imlargo/coral/blob/main/packages/coral/src/lib/components/coral/coral.json),
in every file header, and in the registry item's `meta.version`, so
`https://coral.imlargo.dev/r/kit-combobox.json` tells you the current one without installing
anything.

## If Coral stops

The repository is MIT licensed and maintained by one person. What bounds the risk:

- **You already have a working copy.** Nothing you shipped breaks if this repository or its registry
  disappears. Forking Coral is copying the folder you already have.
- **No runtime of its own.** shadcn-svelte and bits-ui do the underlying work; Coral is
  composition and behavior on top, in files you can read.
- **Tests travel with the repository.** If you take over a component, its browser tests in the
  repository show what it promised.
