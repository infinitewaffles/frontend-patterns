import { RouterOnChangeArgs, route } from 'preact-router';
import { Language } from './lib/common';
import { enumKeys } from './lib/helpers';

// RoutePath: this is the routing table.
export enum RoutePath {
	Home = '/',
	Pure = '/pure/:language',
	Signals = '/signals'
}

export type HomeRoute = { path: RoutePath.Home };
export type PureRoute = { path: RoutePath.Pure; args: { language?: Language } };
export type SignalRoute = { path: RoutePath.Signals; args: { language?: Language } };

// AppRoute: contains all possible routes in the app.
export type AppRoute = HomeRoute | PureRoute | SignalRoute;

// generateUrl: converts an AppRoute to a url that can be pushed to the address bar
export const generateUrl = (r: AppRoute): string => {
	let path: string;
	let query: string;

	switch (r.path) {
		case RoutePath.Home:
			return RoutePath.Home;
		case RoutePath.Pure:
			return r.path.replace(':language', r.args.language || Language.English);
		case RoutePath.Signals:
			path = r.path;
			query = toQuery({
				l: r.args.language || Language.English
			});

			return `${path}?${query}`;
	}
};

const searchParams = (url: string): URLSearchParams => new URL(url, 'http://fake.com').searchParams;

export const toQuery = (args: Record<string, any>): string => {
	const q = new URLSearchParams(args);

	return q.toString();
};

// normalizeRoutePath: converts the path string to a RoutePath.
export const normalizeRoutePath = (s: string | null): RoutePath => {
	for (const r of enumKeys(RoutePath)) {
		if (s === RoutePath[r]) {
			return RoutePath[r];
		}
	}

	return RoutePath.Home;
};

// parseRoute: converts RouterChangeArgs into an AppRoute.
export const parseRoute = (route: RouterOnChangeArgs): AppRoute => {
	const normalized = normalizeRoutePath(route.path);
	const queryParams = searchParams(route.url);

	switch (normalized) {
		case RoutePath.Home:
			return { path: RoutePath.Home };
		case RoutePath.Pure:
			return {
				path: RoutePath.Pure,
				args: { language: Object.values(Language).find((l) => l === route.matches?.language) || Language.English }
			};
		case RoutePath.Signals:
			return {
				path: RoutePath.Signals,
				args: { language: Object.values(Language).find((l) => l === queryParams.get('l')) || Language.English }
			};
	}
};

// routeToUrl: changes the url in the browser.
export const routeToUrl = (r: AppRoute, replace: boolean = false) => route(generateUrl(r), replace);
