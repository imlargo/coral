/**
 * The registry, as the docs site needs to talk about it: the same layers and item names the
 * generator publishes, so an install command cannot name an item that was never built.
 */

export { COMPONENT_LAYERS, isComponent, itemName } from '../../registry.config.js';
