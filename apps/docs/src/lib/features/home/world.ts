/**
 * The product the home page and the examples are set in: one team shipping one app. Every scene
 * reads from here, so a name, a repository or a region is spelled the same everywhere.
 */

export interface Member {
	id: string;
	name: string;
	email: string;
	role: Role;
}

export const ROLES = ['Owner', 'Admin', 'Developer', 'Viewer'] as const;
export type Role = (typeof ROLES)[number];

export const TEAM: Member[] = [
	{ id: 'amara', name: 'Amara Diallo', email: 'amara@example.com', role: 'Owner' },
	{ id: 'wei', name: 'Wei Zhang', email: 'wei@example.com', role: 'Admin' },
	{ id: 'sofia', name: 'Sofia Rossi', email: 'sofia@example.com', role: 'Developer' },
	{ id: 'liam', name: "Liam O'Connor", email: 'liam@example.com', role: 'Developer' },
	{ id: 'priya', name: 'Priya Sharma', email: 'priya@example.com', role: 'Developer' },
	{ id: 'kenji', name: 'Kenji Tanaka', email: 'kenji@example.com', role: 'Viewer' },
	{ id: 'lucas', name: 'Lucas Andersen', email: 'lucas@example.com', role: 'Admin' },
	{ id: 'elena', name: 'Elena van der Meer', email: 'elena@example.com', role: 'Developer' }
];

export const PROJECT = 'web-app';

export const REPOSITORIES = ['web-app', 'api', 'billing-worker', 'docs', 'infra'];

/** Deploy regions. Several carry accents, which is what makes them a good search to try. */
export const REGIONS = [
	{ value: 'gru', label: 'São Paulo', description: 'gru1 · South America' },
	{ value: 'bog', label: 'Bogotá', description: 'bog1 · South America' },
	{ value: 'yul', label: 'Montréal', description: 'yul1 · North America' },
	{ value: 'iad', label: 'Washington, D.C.', description: 'iad1 · North America' },
	{ value: 'zrh', label: 'Zürich', description: 'zrh1 · Europe' },
	{ value: 'krk', label: 'Kraków', description: 'krk1 · Europe' },
	{ value: 'cph', label: 'Copenhagen', description: 'cph1 · Europe' },
	{ value: 'hnd', label: 'Tokyo', description: 'hnd1 · Asia Pacific' },
	{ value: 'bom', label: 'Mumbai', description: 'bom1 · Asia Pacific' }
];

export const ENVIRONMENTS = ['Production', 'Preview', 'Development'] as const;

/** Resolves after `ms`, so a scene's handler takes as long as a request would. */
export const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));
