import { FunctionalComponent } from 'preact';
import Router, { Link, RouterOnChangeArgs } from 'preact-router';
import styles from './app.module.scss';
import * as PureDemo from './pure';
import * as SignalDemo from './signals';

interface DemoRoute {
	title: string;
	path: string;
	view: FunctionalComponent<any>;
}
const routes: DemoRoute[] = [
	{ title: 'Pure Functional Component', path: '/pure', view: PureDemo.View },
	{ title: 'Signal Component', path: '/signals', view: SignalDemo.View }
];

export function App() {
	// ensure that any changes to body that were done by child components are cleared on url change.
	const routeChange = (e: RouterOnChangeArgs) => {
		document.body.scrollTop = 0; // safari
		document.documentElement.scrollTop = 0; // chrome, ff, ie
		document.body.className = '';
	};

	return (
		<div class={styles.app}>
			<Router onChange={routeChange}>
				<div class={styles.home} path="/">
					<h1>UI Kit</h1>
					<p>Here are the components that comprise the Incepto Design Language System.</p>
					<ul>
						{routes.map((r) => (
							<li>
								<Link href={r.path}>{r.title}</Link>
							</li>
						))}
					</ul>
				</div>
				{routes.map((r) => (
					<r.view path={r.path} />
				))}

				<div default={true}>Route Not Found</div>
			</Router>
		</div>
	);
}
