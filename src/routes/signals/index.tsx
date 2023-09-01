import { FunctionalComponent } from 'preact';
import { Language } from '../../lib/common';
import { useLiveSignal } from '../../lib/hooks';
import { RouteHandler } from '../../router';
import { RoutePath, SignalRoute, routeToUrl } from '../../router-utils';
import * as Card from '../../views/signals/card';
import styles from './index.module.scss';

export interface State {
	route: SignalRoute;
	quotes: Record<Language, string>;
}

export const init = (r?: SignalRoute) => ({
	route: r || { path: RoutePath.Signals, args: {} },
	quotes: {
		[Language.English]: 'May the force be with you',
		[Language.French]: 'Que la force soit avec toi',
		[Language.Spanish]: 'Que la fuerza esté con usted',
		[Language.German]: 'Möge die Macht mit dir sein'
	}
});

export const View: FunctionalComponent<State> = ({ route, quotes }) => {
	const selectedLanguage = useLiveSignal(route.args.language || Language.English);
	const onChange = () => routeToUrl({ path: RoutePath.Signals, args: { language: selectedLanguage.value } }, true);

	return (
		<div class={styles.page}>
			<Card.View
				quotes={quotes}
				selectedLanguage={selectedLanguage}
				onChangeLanguage={onChange}
				onNextLanguage={onChange}
			/>
			<hr />
			<div class={styles.reset}>
				<button
					type="button"
					onClick={() => routeToUrl({ path: RoutePath.Signals, args: { language: Language.English } }, true)}
				>
					Reset
				</button>
			</div>
		</div>
	);
};

export default {
	path: RoutePath.Signals,
	init,
	View,
	title: 'Signal Component'
} as RouteHandler<SignalRoute, State>;
