export interface NavLink {
	title: string;
	href: string;
}

export interface NavGroup {
	title: string;
	items: NavLink[];
}

export type NavEntry = NavLink | NavGroup;

export function isNavGroup(entry: NavEntry): entry is NavGroup {
	return 'items' in entry;
}

// Add/remove entries here - the navbar derives from this list. A plain entry renders as a link;
// one with `items` renders as a dropdown group.
export const NAV_ITEMS: NavEntry[] = [
	{ title: 'Home', href: '/' },
	{ title: 'Docs', href: '/docs' }
];
