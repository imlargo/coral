/**
 * What the browser tests run with.
 *
 * The theme, for the same reason the docs site imports it: a component measured without it is a
 * component measured without the styles that give it a line height, a padding or a scrollbar - so
 * a test asking "did this grow" or "can this scroll" would be asking about the browser's defaults
 * rather than about Coral. Nothing here ships.
 */

import './routes/layout.css';
