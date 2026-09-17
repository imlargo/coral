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
			{ title: 'Action button', href: resolve('/docs/kit/action-button') },
			{ title: 'Activity calendar', href: resolve('/docs/kit/activity-calendar') },
			{ title: 'Avatar', href: resolve('/docs/kit/avatar') },
			{ title: 'Avatar stack', href: resolve('/docs/kit/avatar-stack') },
			{ title: 'Combobox', href: resolve('/docs/kit/combobox') },
			{ title: 'Confirm dialog', href: resolve('/docs/kit/confirm-dialog') },
			{ title: 'Copy button', href: resolve('/docs/kit/copy-button') },
			{ title: 'Date picker', href: resolve('/docs/kit/date-picker') },
			{ title: 'File input', href: resolve('/docs/kit/file-input') },
			{ title: 'Inline edit', href: resolve('/docs/kit/inline-edit') },
			{ title: 'Number input', href: resolve('/docs/kit/number-input') },
			{ title: 'Password input', href: resolve('/docs/kit/password-input') },
			{ title: 'Rating group', href: resolve('/docs/kit/rating-group') },
			{ title: 'Relative time', href: resolve('/docs/kit/relative-time') },
			{ title: 'Reorder list', href: resolve('/docs/kit/reorder-list') },
			{ title: 'Responsive dialog', href: resolve('/docs/kit/responsive-dialog') },
			{ title: 'Search input', href: resolve('/docs/kit/search-input') },
			{ title: 'Select', href: resolve('/docs/kit/select') },
			{ title: 'Shortcut', href: resolve('/docs/kit/shortcut') },
			{ title: 'Show more', href: resolve('/docs/kit/show-more') },
			{ title: 'Stepper', href: resolve('/docs/kit/stepper') },
			{ title: 'Tags input', href: resolve('/docs/kit/tags-input') },
			{ title: 'Tree view', href: resolve('/docs/kit/tree-view') }
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
