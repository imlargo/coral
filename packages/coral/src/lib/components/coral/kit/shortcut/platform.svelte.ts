/**
 * @coral/kit/shortcut
 * @version 1.0.0
 */

import { onMount } from 'svelte';
import { detectPlatform } from './keys.js';
import type { Platform } from './keys.js';

/**
 * The platform this page is running on, safe to draw from on the server.
 *
 * `other` until the component mounts, then the real one. The server cannot know it, and drawing `⌘`
 * on the server for a Windows reader - or `Ctrl` on the client over server markup that said `⌘` -
 * is a hydration mismatch. Starting from what the server drew and correcting after mount costs one
 * repaint on a Mac. Construct it while a component initialises, because that is when `onMount` can
 * be registered.
 */
export class PlatformState {
	#current = $state<Platform>('other');

	constructor() {
		onMount(() => {
			this.#current = detectPlatform();
		});
	}

	get current(): Platform {
		return this.#current;
	}
}
