/** Sidebar structure. Adding a page means adding a line here - there is no filesystem magic. */

import { resolve } from '$app/paths';
import type { ResolvedPathname } from '$app/types';

export type DocLink = {
	title: string;
	href: ResolvedPathname;
};

export type DocSection = {
	title: string;
	items: DocLink[];
	/** Shown in place of the list while the section is still empty. */
	empty?: string;
};

// Routes are resolved here rather than at each `<a>`, so a page that gets moved or renamed fails
// type-checking in one place instead of turning into a dead link.
export const nav: DocSection[] = [
	{
		title: 'Getting started',
		items: [
			{ title: 'Introduction', href: resolve('/docs') },
			{ title: 'Installation', href: resolve('/docs/installation') },
			{ title: 'Conventions', href: resolve('/docs/conventions') }
		]
	},
	{
		title: 'Kit',
		items: [
			{ title: 'Avatar', href: resolve('/docs/kit/avatar') },
			{ title: 'Combobox', href: resolve('/docs/kit/combobox') },
			{ title: 'Confirm dialog', href: resolve('/docs/kit/confirm-dialog') }
		]
	},
	{
		title: 'Blocks',
		items: [],
		empty: 'Empty until the same composition shows up in three projects.'
	}
];

/** The flat, ordered list of pages - drives the prev/next footer. */
export const pages: DocLink[] = nav.flatMap((section) => section.items);
