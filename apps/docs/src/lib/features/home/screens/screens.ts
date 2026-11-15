import type { Component } from 'svelte';
import DeploymentScreen from '#lib/features/home/screens/DeploymentScreen.svelte';
import ProjectSettingsScreen from '#lib/features/home/screens/ProjectSettingsScreen.svelte';
import TeamScreen from '#lib/features/home/screens/TeamScreen.svelte';

export interface Screen {
	id: string;
	title: string;
	description: string;
	/** Manifest names of the Coral components the screen is built from: `kit/combobox`. */
	components: string[];
	component: Component;
}

export const SCREENS: Screen[] = [
	{
		id: 'project-settings',
		title: 'Project settings',
		description:
			'Rename the project (api is taken, so that rename is refused), search regions with or without accents, and save: the first save fails while a deployment runs, the retry goes through, and nothing else on the page locks while it waits.',
		components: [
			'kit/breadcrumbs',
			'kit/inline-edit',
			'kit/textarea',
			'kit/select',
			'kit/combobox',
			'kit/number-input',
			'kit/tags-input',
			'kit/action-button'
		],
		component: ProjectSettingsScreen
	},
	{
		id: 'team',
		title: 'Team',
		description:
			'Filter members by name or email, change a role in place, remove someone after confirming, and invite several addresses at once: anything that is not an address, or already on the team, is turned away with a reason.',
		components: [
			'kit/search-input',
			'kit/avatar',
			'kit/select',
			'kit/confirm-dialog',
			'kit/responsive-dialog',
			'kit/tags-input',
			'kit/action-button'
		],
		component: TeamScreen
	},
	{
		id: 'deployment',
		title: 'Deployment',
		description:
			'A build streaming its log. Scroll back and the log stops following; scroll to the end and it picks up again. The activity on the side records each stage as it lands.',
		components: [
			'kit/relative-time',
			'kit/copy-button',
			'kit/avatar',
			'kit/follow-scroll',
			'kit/timeline'
		],
		component: DeploymentScreen
	}
];
