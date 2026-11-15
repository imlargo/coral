/**
 * The sections a component page can be listed under, in sidebar order. A component page names one
 * as `category` in its frontmatter; `coral-pages.test.ts` fails on a page with none of these.
 */
export const COMPONENT_CATEGORIES = [
	'Inputs',
	'Files and media',
	'Actions and overlays',
	'Data display',
	'Navigation'
] as const;

export type ComponentCategory = (typeof COMPONENT_CATEGORIES)[number];
