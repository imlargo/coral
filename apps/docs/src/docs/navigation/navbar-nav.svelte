<script lang="ts">
	import { resolve } from '$app/paths';

	const links = [
		{ title: 'Docs', href: resolve('/docs') },
		{ title: 'Installation', href: resolve('/docs/installation') },
		{ title: 'Kit', href: resolve('/docs/kit/avatar') }
	];
</script>

<nav class="hidden items-center gap-5 text-sm text-muted-foreground sm:flex">
	{#each links as link (link.href)}
		<a href={link.href} class="transition-colors hover:text-foreground">{link.title}</a>
	{/each}
</nav>
