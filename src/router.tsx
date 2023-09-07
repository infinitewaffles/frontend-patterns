import { batch, useSignal } from '@preact/signals';
import { FunctionalComponent } from 'preact';
import Router, { RouterOnChangeArgs } from 'preact-router';
import Match from 'preact-router/match';
import { useEffect } from 'preact/hooks';
import { GlobalState, UserType } from './lib/state';
import { RoutePath, parseRoute } from './router-utils';
import styles from './router.module.scss';
import DndDemo from './routes/dnd';
import HomePage from './routes/home';
import PureDemo from './routes/pure';
import SignalDemo from './routes/signals';
import { Header } from './views/header/header';

export interface RouteHandler<R, S> {
	path: RoutePath;
	title: string;
	init: (r?: R) => S | undefined;
	View: FunctionalComponent<S>;
}

export const defaultRouteList: RouteHandler<any, any>[] = [HomePage, PureDemo, SignalDemo, DndDemo];

interface Args {
	globalState: GlobalState;
	routeList?: RouteHandler<any, any>[];
}

export const AppRouter: FunctionalComponent<Args> = ({ globalState, routeList = defaultRouteList }) => {
	const state = useSignal(globalState);

	// This is funky. This effect bind the upstream (non-rendering signals) so that a change upstream will
	// trigger a re-render here.
	useEffect(() => {
		const updateState = () =>
			batch(() => {
				if (state.value.currentRoute.value !== globalState.currentRoute.value) {
					state.value = { user: globalState.user, currentRoute: globalState.currentRoute };
				}

				if (state.value.user.value !== globalState.user.value) {
					state.value = { user: globalState.user, currentRoute: globalState.currentRoute };
				}
			});

		const unsubscribe = [globalState.user.subscribe(updateState), globalState.currentRoute.subscribe(updateState)];

		return () => unsubscribe.map((fn) => fn());
	}, []);

	const { user, currentRoute } = state.value;

	// ensure that any changes to body that were done by child components are cleared on url change.
	const routeChange = (e: RouterOnChangeArgs) => {
		document.body.scrollTop = 0; // safari
		document.documentElement.scrollTop = 0; // chrome, ff, ie
		document.body.className = '';
		currentRoute.value = parseRoute(e);
	};

	return (
		<div class={styles.app}>
			{/* TODO: talk with Chad about how we should tackle page layouts. */}
			<Header
				onSignIn={() => {
					user.value = { userType: UserType.Authenticated, name: 'Bill Murray' };
				}}
				onSignOut={() => {
					user.value = { userType: UserType.Anonymous };
				}}
			/>
			<Router onChange={routeChange}>
				{routeList.map((r) => (
					<Match path={r.path}>{() => <r.View {...r.init(currentRoute.value)} />}</Match>
				))}

				<div default={true}>Route Not Found</div>
			</Router>
		</div>
	);
};
