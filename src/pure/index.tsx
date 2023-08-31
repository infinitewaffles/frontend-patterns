import { FunctionalComponent } from 'preact';
import { useState } from 'preact/hooks';
import * as Card from './card';

const quotes = {
	[Card.Language.English]: 'May the force be with you',
	[Card.Language.French]: 'Que la force soit avec toi',
	[Card.Language.Spanish]: 'Que la fuerza esté con usted',
	[Card.Language.German]: 'Möge die Macht mit dir sein'
};

export const View: FunctionalComponent<{}> = ({}) => {
	const [selectedLanguage, setSelectedLanguage] = useState(Card.Language.English);

	return (
		<div>
			<Card.View quotes={quotes} selectedLanguage={selectedLanguage} onChangeLanguage={(l) => setSelectedLanguage(l)} />
		</div>
	);
};
