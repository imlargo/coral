<script lang="ts">
	import AvatarStack from '$lib/coral/kit/avatar-stack/avatar-stack.svelte';
	import { AvatarGroupCount } from '$lib/components/ui/avatar/index.js';
	import * as Popover from '$lib/components/ui/popover/index.js';

	type Member = { id: number; fullName: string; photo?: string };

	const members: Member[] = [
		{ id: 1, fullName: 'Amara Diallo', photo: 'https://github.com/shadcn.png' },
		{ id: 2, fullName: 'Wei Zhang' },
		{ id: 3, fullName: 'Sofia Rossi' },
		{ id: 4, fullName: "Liam O'Connor" },
		{ id: 5, fullName: 'Priya Sharma' },
		{ id: 6, fullName: 'Kenji Tanaka' }
	];
</script>

<AvatarStack
	items={members}
	max={3}
	label="Project members"
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
