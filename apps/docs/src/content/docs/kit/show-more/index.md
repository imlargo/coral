---
title: Show more
description: Clamps long content to a few lines, and only offers to expand what actually overflows.
group: Kit
---

<script lang="ts">
	import Preview from '#lib/features/docs/components/Preview.svelte';
	import basicDemo from './demos/basic.svelte?demo';
	import richDemo from './demos/rich.svelte?demo';
</script>

A description, an incident note, release notes: clamp it with `line-clamp-3` and add a "Show more"
button, and the button shows up under text that already fits, the clamp does nothing to a paragraph
followed by a list, and tabbing onto a link inside the hidden part puts focus somewhere nobody can
see.

<Preview demo={basicDemo} />

## When to use

**Use it when**

- A block of text of unknown length sits in a dense layout: a project description, an incident
  note, release notes in a list of deployments.
- Most entries are short and only some overflow, so a button under every one would be noise.
- The content is markup, not one run of text: paragraphs, lists, links.

**Reach for something else when**

- The hidden part is a separate section with its own heading: a shadcn `Collapsible` or
  `Accordion`, which hide it from everyone, assistive tech included.
- The content is a list of items, like the members of a team: show the first few and a count, or
  an [Avatar stack](/docs/kit/avatar-stack) for people.
- One line is enough and the full text can live in a tooltip or a detail page: Tailwind's
  `truncate`.

## Usage

```svelte
<script lang="ts">
	import ShowMore from '#lib/components/coral/kit/show-more/show-more.svelte';
</script>

<ShowMore lines={3}>
	<p>
		Webhook deliveries to the staging environment failed for 40 minutes after the signing secret was
		rotated. Retries with backoff delivered every queued event once the new secret was deployed, and
		no event was dropped.
	</p>
</ShowMore>
```

## Examples

### Rich content, custom toggle

<Preview demo={richDemo} />

The `toggle` snippet receives `props` to spread onto your own button (they carry the ARIA wiring and
the click handler), plus `expanded` and `toggle`.

### Content that fits

Overflow is measured, and re-measured as the width or the content changes. Content that fits in
`lines` gets no toggle at all. Once expanded, the toggle stays so the reader can collapse it again.

### Collapsing a long block

If the top of a long block has scrolled away, collapsing brings it back into view instead of
leaving the reader somewhere below where the content now ends.

## Props

Everything a `<div>` accepts stays available on the root. On top of that:

| Prop               | Type                                     | Default     | Description                     |
| ------------------ | ---------------------------------------- | ----------- | ------------------------------- |
| `lines`            | `number`                                 | `3`         | Lines shown while collapsed.    |
| `expanded`         | `boolean`                                | `false`     | Bindable.                       |
| `onexpandedchange` | `(expanded: boolean) => void`            | -           | The reader toggled it.          |
| `moreLabel`        | `string`                                 | `Show more` | Default toggle, collapsed.      |
| `lessLabel`        | `string`                                 | `Show less` | Default toggle, expanded.       |
| `class`            | `string`                                 | -           | Merged onto the root.           |
| `contentClass`     | `string`                                 | -           | Merged onto the clipped region. |
| `children`         | `Snippet`                                | -           | The content. Required.          |
| `toggle`           | `Snippet<[{ props, expanded, toggle }]>` | -           | Replaces the toggle.            |

## Keyboard

The toggle is a native button: `Tab` reaches it, and `Enter` or `Space` expands or collapses the
content. Focus that lands on a link or a button inside the clipped part, with `Tab` or `Shift` +
`Tab`, expands the content first, so the keyboard never ends up somewhere invisible.

## Accessibility

Clipped content is still in the accessibility tree, so a screen reader reads all of it: clamping is
a visual convenience, not a way to hide text. That is also why the button's label does not need to
describe what is hidden.

- **Wired up.** The toggle carries `aria-expanded`, and `aria-controls` pointing at the clipped
  region.
- **Focus never lands out of sight.** Tabbing onto a link in the clipped part expands the content.

## Customizing

- **Class props.** `class` merges onto the root, `contentClass` onto the clipped region.
- **The toggle.** The `toggle` snippet receives `props` to spread onto your own button, carrying
  `type`, `aria-expanded`, `aria-controls` and the click handler, plus `expanded` and `toggle`.
- **Project-wide defaults.** `moreLabel` and `lessLabel` can be stated once under `'kit/show-more'`
  with `setCoralDefaults`: see [Project-wide defaults](/docs/conventions#project-wide-defaults).

The default toggle is shadcn's `Button` with `variant="link"`. Dropping to `line-clamp` and a
button of your own means rebuilding the overflow measurement, the expand when focus lands in the
clipped part, and the scroll back on collapse.

### Why a height cut

The content is clipped by height in `lh` units (the content's own line height), so paragraphs,
lists and inline elements are cut alike. `line-clamp` only counts one run of inline text.

A height cut can slice an image in half at the boundary. That is the trade for clamping any markup,
and the right one for text; for a gallery, show a count of items instead.
