import { FunctionalComponent } from 'preact';
import { Link } from 'preact-router';
import { RouteHandler, defaultRouteList } from '../../router';
import { HomeRoute, RoutePath, generateUrl } from '../../router-utils';
import styles from './index.module.scss';

export interface State {
	route: HomeRoute;
	routes: RouteHandler<any, any>[];
}

export const init = (r?: HomeRoute): State => ({
	route: r || { path: RoutePath.Home },
	routes: defaultRouteList
});

export const View: FunctionalComponent<State> = ({ routes }) => {
	return (
		<div class={styles.home} path="/">
			<p>
				This repo is a demo of design patterns for components and state interactions. It is meant to be complete meaning
				that any FE capabilities should be represented and concise meaning that it is as small as possible to show the
				capability.
			</p>
			<ul>
				{routes.map((r) => (
					<li>
						<Link href={generateUrl(r.init().route)}>{r.title}</Link>
					</li>
				))}
			</ul>
		</div>
	);
};

export default {
	path: RoutePath.Home,
	init,
	View,
	title: 'Home'
} as RouteHandler<HomeRoute, State>;
