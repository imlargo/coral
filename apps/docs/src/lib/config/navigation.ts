export interface NavLink {
	title: string;
	href: string;
}

// The navbar and the mobile menu both read this list.
export const NAV_ITEMS: NavLink[] = [
	{ title: 'Docs', href: '/docs' },
	{ title: 'Changelog', href: '/docs/changelog' }
];
