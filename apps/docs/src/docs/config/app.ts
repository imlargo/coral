import defaultLogo from '$assets/logo.svg';
import defaultFavicon from '$assets/favicon.svg';

export interface AppConfig {
	/** Single source of truth for name/logo/favicon/SEO. */
	branding: {
		name: string;
		logo: string;
		favicon: string;
		seo: {
			title: string;
			description: string;
		};
	};
	links: {
		/** Repository URL. The navbar's GitHub button only links out when this is set. */
		github: string;
	};
}

export const config: AppConfig = {
	branding: {
		name: 'Coral',
		logo: defaultLogo,
		favicon: defaultFavicon,
		seo: {
			title: 'Coral - components for shadcn-svelte',
			description: 'An ergonomics layer on top of shadcn-svelte. One folder, installed as source.'
		}
	},
	links: {
		github: 'https://github.com/imlargo/coral'
	}
};
