/**
 * Where Coral is published.
 *
 * One constant, read by both workspaces: the generator writes it into every item's docs link, and
 * the docs site builds the install command from it. They are the same URL - the site serves the
 * registry it documents - and stating it twice is how a docs page ends up printing a command that
 * installs from somewhere that no longer exists.
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
