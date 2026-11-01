import type { Component } from 'svelte';

/** A docs demo, as `import demo from './demos/<name>.svelte?demo'` gives it. */
export interface Demo {
	/** The rendered demo. */
	component: Component;
	/** Its source highlighted at build time, plus the plain text behind it, for copying. */
	source: { html: string; text: string };
}

/**
 * Not validated by a schema — this is the project's own content, not user input — so the routes
 * that read it cast to this instead of adding a validator dependency for three strings.
 */
export interface DocsFrontmatter {
	title: string;
	description?: string;
	/** Sidebar section this page is listed under. */
	group: string;
	/** ISO date (e.g. `2026-09-20`). Shown at the bottom of the page when set. */
	updated?: string;
}

export interface SidebarLink {
	title: string;
	href: string;
}

export interface SidebarGroup {
	title: string;
	items: SidebarLink[];
}
