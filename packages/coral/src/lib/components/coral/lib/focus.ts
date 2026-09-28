/**
 * @coral/lib/focus
 * @version 1.0.0
 */

/**
 * The focus indicator for a control Coral draws itself: an outline in the theme's `ring` colour,
 * pushed out from the edge so it reads on any background.
 *
 * `focus-visible`, not `focus`: a pointer press must not leave a ring behind on something the
 * reader just clicked, and the keyboard - which is who the ring is for - always gets one. The
 * shadcn primitives draw their own; this is for the bare `<button>`s and rows Coral renders where
 * there is no primitive to ask.
 */
export const focusRing = 'outline-offset-2 focus-visible:outline-2 focus-visible:outline-ring';

/**
 * For a row inside a box that clips: drawn inside its edge, where an outset ring would be cut off
 * by the tree or list around it.
 */
export const focusRingInset =
	'-outline-offset-2 focus-visible:outline-2 focus-visible:outline-ring';

/** For a mark small enough that a full-size gap would swallow its neighbours. */
export const focusRingTight = 'outline-offset-1 focus-visible:outline-2 focus-visible:outline-ring';

/**
 * For a wrapper whose focusable part is a visually hidden input inside it - the rating stars, whose
 * radios are clipped to a pixel. The ring goes on the box the reader sees.
 */
export const focusRingWithin =
	'outline-offset-2 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-ring';
