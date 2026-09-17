<script lang="ts">
	import AvatarStack from '$lib/coral/kit/avatar-stack/avatar-stack.svelte';
	import { AvatarGroupCount } from '$lib/components/ui/avatar/index.js';
	import * as Popover from '$lib/components/ui/popover/index.js';

	type Member = { id: number; fullName: string; photo?: string };

	const members: Member[] = [
		{ id: 1, fullName: 'Ana Restrepo', photo: 'https://github.com/shadcn.png' },
		{ id: 2, fullName: 'Juan Herrera' },
		{ id: 3, fullName: 'Camila Ospina' },
		{ id: 4, fullName: 'Diego Marín' },
		{ id: 5, fullName: 'Laura Gómez' },
		{ id: 6, fullName: 'Andrés Torres' }
	];
</script>

<AvatarStack
	items={members}
	max={3}
	label="Participantes"
	getKey={(member) => member.id}
	getPerson={(member) => ({ name: member.fullName, src: member.photo })}
>
	{#snippet overflow({ hidden, count, label })}
		<Popover.Root>
			<Popover.Trigger>
				{#snippet child({ props })}
					<AvatarGroupCount role="listitem">
						<button {...props} type="button" aria-label={label} class="size-full rounded-full">
							+{count}
						</button>
					</AvatarGroupCount>
				{/snippet}
			</Popover.Trigger>
			<Popover.Content class="w-56">
				<ul class="flex flex-col gap-1 text-sm">
					{#each hidden as member (member.id)}
						<li>{member.fullName}</li>
					{/each}
				</ul>
			</Popover.Content>
		</Popover.Root>
	{/snippet}
</AvatarStack>
