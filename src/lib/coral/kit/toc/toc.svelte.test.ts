/**
 * @coral/kit/toc
 * @version 1.0.0
 */

import { render } from 'vitest-browser-svelte';
import { describe, expect, it } from 'vitest';
import Toc from './toc.svelte';

/** An article that scrolls inside its own box, so the test controls the scroll position. */
function article(): HTMLElement {
	const box = document.createElement('div');
	box.style.cssText = 'height: 200px; overflow-y: auto';
	box.innerHTML = `
		<h2>Instalación</h2><p style="height: 300px"></p>
		<h2 id="fijo">Uso</h2><p style="height: 300px"></p>
		<h3>Props</h3><p style="height: 60px"></p>
		<h2>Props</h2><p style="height: 300px"></p>`;
	document.body.appendChild(box);
	return box;
}

const links = () => Array.from(document.querySelectorAll('nav a'));
const current = () => document.querySelector('nav a[aria-current]')?.textContent?.trim();

async function scrollTo(box: HTMLElement, top: number) {
	box.scrollTop = top;
	box.dispatchEvent(new Event('scroll'));
	// The measurement is taken on the next frame.
	await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
}

describe('headings read from the page', () => {
	it('collects them, keeps ids it is given, and invents the rest', async () => {
		const box = article();
		await render(Toc, { container: box, root: box, offset: 0 });

		expect(links().map((link) => link.textContent?.trim())).toEqual([
			'Instalación',
			'Uso',
			'Props',
			'Props'
		]);
		expect(links().map((link) => link.getAttribute('href'))).toEqual([
			'#instalacion',
			'#fijo',
			'#props',
			'#props-2'
		]);
		box.remove();
	});

	it('indents by level, from the shallowest one present', async () => {
		const box = article();
		await render(Toc, { container: box, root: box, offset: 0 });

		const padding = links().map((link) =>
			(link.parentElement as HTMLElement).style.paddingInlineStart.includes('* 0')
		);
		expect(padding).toEqual([true, true, false, true]);
		box.remove();
	});
});

describe('the active heading', () => {
	it('starts on the first one', async () => {
		const box = article();
		await render(Toc, { container: box, root: box, offset: 0 });
		await scrollTo(box, 0);

		expect(current()).toBe('Instalación');
		box.remove();
	});

	it('follows the last heading scrolled past', async () => {
		const box = article();
		await render(Toc, { container: box, root: box, offset: 0 });

		// Measured, not a magic number: default heading margins differ between engines.
		const second = box.querySelector<HTMLElement>('#fijo')!;
		await scrollTo(box, second.offsetTop - box.offsetTop + 1);
		expect(current()).toBe('Uso');
		box.remove();
	});

	it('activates the last heading at the bottom, which a boundary alone never reaches', async () => {
		const box = article();
		await render(Toc, { container: box, root: box, offset: 0 });

		await scrollTo(box, box.scrollHeight);
		expect(current()).toBe('Props');
		expect(links()[3].getAttribute('aria-current')).toBe('location');
		box.remove();
	});
});

describe('rendering', () => {
	it('draws nothing until there are enough headings', async () => {
		const box = document.createElement('div');
		box.innerHTML = '<h2>Solo uno</h2>';
		document.body.appendChild(box);

		await render(Toc, { container: box, root: box });
		expect(document.querySelector('nav')).toBeNull();
		box.remove();
	});
});
