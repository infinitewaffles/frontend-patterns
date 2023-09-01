import { FunctionalComponent } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import { Language } from '../../lib/common';
import { RouteHandler } from '../../router';
import { PureRoute, RoutePath, routeToUrl } from '../../router-utils';
import * as Card from '../../views/pure/card';

export interface State {
	route: PureRoute;
	quotes: Record<Language, string>;
}

export const init = (r?: PureRoute) => ({
	route: r || { path: RoutePath.Pure, args: {} },
	quotes: {
		[Language.English]: 'May the force be with you',
		[Language.French]: 'Que la force soit avec toi',
		[Language.Spanish]: 'Que la fuerza esté con usted',
		[Language.German]: 'Möge die Macht mit dir sein'
	}
});

export const View: FunctionalComponent<State> = ({ quotes, route }) => {
	const [selectedLanguage, setSelectedLanguage] = useState(route.args.language || Language.English);

	useEffect(() => setSelectedLanguage(route.args.language || Language.English), [route]);

	return (
		<div>
			<Card.View
				quotes={quotes}
				selectedLanguage={selectedLanguage}
				onChangeLanguage={(l) => routeToUrl({ path: RoutePath.Pure, args: { language: l } }, true)}
			/>
		</div>
	);
};

export default {
	path: RoutePath.Pure,
	init,
	View,
	title: 'Pure Functional Component'
} as RouteHandler<PureRoute, State>;
