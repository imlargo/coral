---
title: Lightbox
description: Images and videos full screen, moved through by keyboard, touch or pointer, with the reader told where they are and returned to the thumbnail they left.
group: Kit
category: Files and media
---

<script lang="ts">
	import Preview from '#lib/features/docs/components/Preview.svelte';
	import basicDemo from './demos/basic.svelte?demo';
	import videosDemo from './demos/videos.svelte?demo';
	import customDemo from './demos/custom.svelte?demo';
</script>

Opening a screenshot or a recording full screen from a grid is a `Dialog` with an `<img>` in it,
written again for every gallery, and the hand-rolled version misses the same things each time: the
arrow keys and the swipe between items, an Escape that closes the viewer rather than the dialog
behind it, focus that goes back to the thumbnail, a position the reader can hear, the next picture
loaded before it is asked for, and a video that keeps playing after the reader has moved on.
shadcn's `carousel` scrolls a strip; it is not a viewer.

<Preview demo={basicDemo} />

## When to use

**Use it when**

- A grid of screenshots or recordings opens one full screen and lets the reader move through the
  rest.
- The items mix images and videos, and a video must stop when the reader moves on.
- Each item needs a caption or an action beside its position, through `footer`.

**Reach for something else when**

- Items scroll past in a strip on the page itself: the shadcn `Carousel`.
- One image opens on its own, with nothing to move to: the shadcn `Dialog` with an `<img>`.
- The content is a form or text rather than media: [responsive dialog](/docs/kit/responsive-dialog).

## Usage

```svelte
<script lang="ts">
	import Lightbox from '#lib/components/coral/kit/lightbox/lightbox.svelte';
	import type { LightboxMedia } from '#lib/components/coral/kit/lightbox/types.js';

	const shots: LightboxMedia[] = [
		{ src: '/shots/deployments.png', alt: 'The deployments list' },
		{ src: '/shots/settings.png', alt: 'The project settings page' }
	];

	let open = $state(false);
	let index = $state(0);
</script>

{#each shots as shot, at (shot.src)}
	<button
		type="button"
		onclick={() => {
			index = at;
			open = true;
		}}
	>
		<img src={shot.src} alt={shot.alt} />
	</button>
{/each}

<Lightbox items={shots} bind:open bind:index />
```

## Examples

### Opening from a grid

The viewer has no trigger of its own: a gallery is the project's, and every thumbnail is a button
that sets `index` and `open`. Focus returns to whichever button that was.

<Preview demo={videosDemo} />

### Your own slides

<Preview demo={customDemo} />

`items` is generic: `getMedia` says what the default slide reads from an item, and the `media`
snippet replaces the slide altogether while the moving, the position and the keyboard stay. `footer`
sits beside the position for a caption or an action on the current item.

### Loading and video

The pictures beside the current one are fetched eagerly, so moving never shows an empty frame; the
rest wait until they are near. A portrait video in a landscape window and the reverse both fit the
room they have, and a video stops the moment the reader moves away from it.

### One item, or none

With a single item the previous and next controls are not rendered and dragging is off. With an
empty `items` the dialog still opens, named by `label`, with no slides in it.

## Props

Everything the shadcn dialog root accepts stays available: `onOpenChange`, `onOpenChangeComplete`.
On top of that:

| Prop            | Type                                  | Default        | Description                                            |
| --------------- | ------------------------------------- | -------------- | ------------------------------------------------------ |
| `items`         | `T[]`                                 | -              | The gallery, in order. Required.                       |
| `getMedia`      | `(item: T) => LightboxMedia`          | identity       | What the default slide reads from an item.             |
| `open`          | `boolean`                             | `false`        | Bindable.                                              |
| `index`         | `number`                              | `0`            | Bindable. Set it before opening.                       |
| `onindexchange` | `(index: number) => void`             | -              | The reader moved. Never when `index` is set from code. |
| `label`         | `string`                              | `Media viewer` | Names the dialog.                                      |
| `positionLabel` | `(position, total) => string`         | `{n} of {m}`   | Shown and announced.                                   |
| `previousLabel` | `string`                              | `Previous`     | Accessible label of the back control.                  |
| `nextLabel`     | `string`                              | `Next`         | Accessible label of the forward control.               |
| `class`         | `string`                              | -              | Merged onto the dialog content.                        |
| `media`         | `Snippet<[{ item, index, current }]>` | -              | Replaces a slide.                                      |
| `footer`        | `Snippet<[{ item, index, current }]>` | -              | Rendered beside the position.                          |

### LightboxMedia

| Field    | Type                 | Description                                     |
| -------- | -------------------- | ----------------------------------------------- |
| `kind`   | `'image' \| 'video'` | `image` unless said otherwise.                  |
| `src`    | `string`             | The file.                                       |
| `alt`    | `string`             | What an image shows; a video's accessible name. |
| `poster` | `string`             | A video's still frame.                          |

## Keyboard

The keys work wherever focus is inside the open viewer, not only while the previous or next button
has it.

| Key      | Action                                                     |
| -------- | ---------------------------------------------------------- |
| `→`      | Next item. Previous in a right-to-left page.               |
| `←`      | Previous item. Next in a right-to-left page.               |
| `Home`   | First item.                                                |
| `End`    | Last item.                                                 |
| `Tab`    | Moves between the controls; focus stays inside the viewer. |
| `Escape` | Closes the viewer and returns focus to the thumbnail.      |

## Accessibility

The dialog is the primitive's: `role="dialog"`, `aria-modal`, named by `label` and described by the
position, with focus trapped inside and returned on close. Each slide is a `group` with the role
description `slide`, from the carousel. The previous and next controls are real buttons, disabled at
the ends, and every move is announced assertively, since it is something the reader just did.
Images carry their `alt`; a video carries `aria-label` and the browser's own controls.

- **A dialog around a carousel.** Escape closes the viewer and nothing else, focus is trapped
  inside it while it is open and returns to the thumbnail that opened it when it closes. The swipe,
  the drag and the buttons are the carousel primitive's.
- **"3 of 12", seen and heard.** The position is the dialog's description, shown under the slides,
  and announced on every move.

## Customizing

- `class` is merged onto the dialog content, which Coral sizes to the window less a margin.
- `getMedia` maps your own item type to what the default slide reads; `media` replaces the slide,
  and `footer` sits beside the position. Both receive `{ item, index, current }`.
- `label`, `positionLabel`, `previousLabel` and `nextLabel` can be set once for the project with
  [`setCoralDefaults`](/docs/conventions#project-wide-defaults) under `kit/lightbox`.
- Everything the shadcn dialog root accepts, such as `onOpenChange` and `onOpenChangeComplete`,
  passes through.

The pieces are the shadcn `Dialog` and `Carousel`, plus `lib/announce` and `lib/live-region` for the
position. Dropping to them means rebuilding the keys that work from anywhere, the right-to-left
swap, the position as description and announcement, the loading ahead, the paused videos and the
one `index` that a swipe and an assignment from code both move.
