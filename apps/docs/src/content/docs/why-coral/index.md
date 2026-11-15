---
title: Why Coral
description: What goes wrong when these components are written by hand, and how Coral compares to shadcn-svelte and to a component package.
group: Getting started
---

A product built on shadcn-svelte ends up writing the same layer on top of it: the combobox, the
date range picker, the dialog that confirms a delete, the file input, the number field. The
primitives are excellent, and deliberately unopinionated about behavior. So every team writes that
layer again, and the details that make it work for everyone are the ones that go missing: accents
in search, focus after a pick, a second click while a request is out, what a screen reader hears
when a list is empty.

Coral is that layer, written once, tested in a real browser and checked with axe, and handed to you
as source.

## Case by case

What happens when each case is hand-rolled on shadcn-svelte and bits-ui, and what the Coral
component does instead. Every row has a live demo on the component's page.

| Case                                  | Hand-rolled                                            | Coral                                                    |
| ------------------------------------- | ------------------------------------------------------ | -------------------------------------------------------- |
| Combobox search                       | exact substring, case- and accent-sensitive            | folds accents: `acai` finds `Açaí`                       |
| Combobox with server-side search      | the selected label vanishes once results drop it       | remembers what it showed as selected                     |
| Combobox, after picking an option     | focus is lost to the page body                         | returns to the trigger                                   |
| Confirm dialog when the action fails  | re-open and pending state wired per instance           | stays open, blocks a second submit, one prop             |
| Date range picker                     | closes on the first click, mid-range                   | closes once the range is complete                        |
| A select whose options are loading    | an empty, clickable list                               | says it is loading, in the list and out loud             |
| A select's bound value                | bits-ui's string keys                                  | keeps the type you gave it: a number, a union, an object |
| Number input, `1,5` typed in `de-DE`  | dropped: `type="number"` reads it as empty             | one and a half, shown back with the comma                |
| Tags typed vs pasted                  | two code paths, two rules to keep in sync              | one delimiter rule for both                              |
| Escape in a search inside a dialog    | closes the dialog along with the term                  | the first Escape clears the term, the second closes      |
| Password shown when the form submits  | the password manager never offers to save it           | back to `type="password"` before the form is read        |
| A file dropped on the input twice     | added twice                                            | de-duplicated                                            |
| Reordering a list on a phone          | HTML5 drag and drop fires nothing on touch             | pointer events for touch, and a full keyboard path       |
| "5 minutes ago" on a page left open   | stale, or a timer per timestamp every second           | each label wakes only when its own text changes          |
| Table of contents, last section       | never highlights                                       | the end of the page activates the final heading          |
| A deep breadcrumb trail on a phone    | wraps, or every crumb truncates                        | folds the middle into a menu, keeps both ends readable   |
| A phone number as typed               | stored as typed, with no country code                  | bound as E.164 (`+14155550123`), formatted on screen     |
| ⌘K palette off a Mac                  | opens on Ctrl+K, then refuses to close on it           | the primitive's vim bindings give way to your combo      |
| Copy in a product that is not English | the same `placeholder` and `locale` at every call site | stated once with `setCoralDefaults`                      |

## Compared with shadcn-svelte

Coral is not an alternative to shadcn-svelte. It needs it.

|                      | shadcn-svelte                                  | Coral                                                 |
| -------------------- | ---------------------------------------------- | ----------------------------------------------------- |
| What it gives you    | primitives: popover, command, calendar, dialog | components composed from them: combobox, date picker  |
| Appearance           | the theme, and the primitives' own styles      | none of its own: it inherits the primitives and theme |
| Behavior             | the primitive's, deliberately general          | resolved for one job: search, async, focus, empty     |
| Install              | `shadcn-svelte add button`                     | `shadcn-svelte add <coral item url>`, same CLI        |
| Where the code lives | `src/lib/components/ui/`                       | `src/lib/components/coral/`, beside it                |
| Ownership            | yours once added                               | yours once added                                      |

A Coral component installs the shadcn primitives it uses, in your project's style, if they are not
there yet. It never edits them: your `ui/` folder stays exactly what shadcn-svelte wrote.

Where shadcn-svelte documents a recipe rather than a component (its combobox is a popover, a
command menu and fifty lines of wiring), Coral is the component the recipe turns into, with the
parts the recipe leaves out.

## Compared with a component package

An npm component library is versioned for you: one `npm update` moves every component, and a fix
reaches you without reading code. The price is that you cannot change what it does, and its look
comes with it.

Coral makes the other trade. You own the source, so you can change anything, and nothing updates
behind your back. Each component has its own version, and updating one is a command you run when
you choose, with a diff you can read. [Ownership and updates](/docs/ownership) covers how that goes
in practice.

## Compared with writing it yourself

You can: every Coral component is built from public shadcn-svelte primitives, and its source is a
page away. What you would write is what is listed above, and the tests for it. Coral's components
run in a real browser under Vitest, and every one is checked with axe in each state that changes
its markup (open, busy, empty).

## When Coral is not the right fit

- **You want a package that updates itself.** Coral is source you own; updates are deliberate.
- **You need a component Coral does not have.** It adds components only after the same pattern
  has been written twice in production. Build it in your project; if it keeps coming back, it may
  belong here later.
- **Your project does not use shadcn-svelte.** Coral composes its primitives and reads its theme.
  Without them there is nothing for it to stand on.
