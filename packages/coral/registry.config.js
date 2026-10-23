/**
 * Where Coral is published, and under which names.
 *
 * Read by both workspaces: the generator writes the URL into every item's docs link and names the
 * items, and the docs site builds each page's install command from the same two. They have to
 * agree - the site serves the registry it documents - and stating any of this twice is how a docs
 * page ends up printing a command that installs from somewhere that no longer exists.
 */

/** The docs site, which is also the registry host. No trailing slash. */
export const SITE = 'https://coral.imlargo.dev';

/** Where the built items are served from, relative to the site. */
export const REGISTRY_PATH = '/r';

/**
 * The URL a registry item is installed from.
 *
 * @param {string} item the item name, e.g. `kit-select`
 */
export const itemUrl = (item) => `${SITE}${REGISTRY_PATH}/${item}.json`;

/**
 * The item name a manifest entry is published under: `kit/select` becomes `kit-select`.
 *
 * The slash cannot survive - it would write the item into a subdirectory of the registry output -
 * and the prefix cannot be dropped: the CLI merges an item's tree by name, so a Coral item called
 * `select` and shadcn's own `select` would be taken for the same thing and one of them silently
 * dropped, along with its files.
 *
 * @param {string} name
 */
export function itemName(name) {
	return name.replace('/', '-');
}

/**
 * The layers whose entries are folders, and which a consumer installs by name. `lib/*` entries are
 * single files pulled in as dependencies of these, never asked for directly.
 */
export const COMPONENT_LAYERS = ['kit/', 'blocks/'];

/**
 * Whether a manifest entry is one of those - a thing with a page, an install command and a folder.
 *
 * @param {string} name
 */
export function isComponent(name) {
	return COMPONENT_LAYERS.some((layer) => name.startsWith(layer));
}
