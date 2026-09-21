/**
 * The registry, as the docs site needs to talk about it.
 *
 * The naming rule lives in the library (`scripts/registry.js`), which is what actually publishes
 * the items; this re-states only the part the site needs - a docs slug is one of those names with
 * its slash swapped - and the test in the library keeps the two honest by checking the generated
 * items against the pages.
 */

/** The registry item a `kit/*` docs slug documents: `kit/select` is published as `kit-select`. */
export const itemName = (slug: string): string => slug.replace('/', '-');
