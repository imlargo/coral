/**
 * Where Coral is published, and under which names.
 *
 * Read by the generator, by the docs site and by the repo's tests. They have to agree - the site
 * serves the registry it documents - and stating any of this twice is how a docs page ends up
 * printing a command that installs from somewhere that no longer exists.
 */

/** The docs site, which is also the registry host. No trailing slash. */
export const SITE = 'https://coral.imlargo.dev';

/** Where the built items are served from, relative to the site. */
export const REGISTRY_PATH = '/r';

/**
 * The layers a consumer installs from by name, each with a docs page per entry. `lib/` is not one:
 * its files arrive as dependencies of these. A `product/` entry sits one folder deeper, under the
 * vertical it speaks: `product/ai/<name>`.
 */
export const COMPONENT_LAYERS = ['kit/', 'blocks/', 'product/'];

/** @param {string} layer */
const depthOf = (layer) => (layer === 'product/' ? 3 : 2);

/**
 * Whether a manifest entry belongs to one of those layers.
 *
 * @param {string} name
 */
export const isComponent = (name) => COMPONENT_LAYERS.some((layer) => name.startsWith(layer));

/**
 * The entry a file under `coral/` belongs to: `kit/select/select.svelte` is `kit/select`, and
 * `product/ai/chat/chat.svelte` is `product/ai/chat`. `undefined` for `lib/` and for loose files.
 *
 * @param {string} file
 */
export function componentOf(file) {
	const layer = COMPONENT_LAYERS.find((prefix) => file.startsWith(prefix));
	if (!layer) return undefined;

	const segments = file.split('/');
	const depth = depthOf(layer);
	return segments.length > depth ? segments.slice(0, depth).join('/') : undefined;
}

/**
 * The item an entry is published as: `kit/select` becomes `kit-select`. The layer stays in the name
 * because the CLI merges a dependency tree by name, and a bare `select` would be taken for shadcn's.
 *
 * @param {string} name
 */
export const itemName = (name) => name.replaceAll('/', '-');

/**
 * The URL a registry item is installed from.
 *
 * @param {string} item the item name, e.g. `kit-select`
 */
export const itemUrl = (item) => `${SITE}${REGISTRY_PATH}/${item}.json`;
