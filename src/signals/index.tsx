import { useSignal } from '@preact/signals';
import { FunctionalComponent } from 'preact';
import * as Card from './card';
import styles from './index.module.scss';

const quotes = {
	[Card.Language.English]: 'May the force be with you',
	[Card.Language.French]: 'Que la force soit avec toi',
	[Card.Language.Spanish]: 'Que la fuerza esté con usted',
	[Card.Language.German]: 'Möge die Macht mit dir sein'
};

export const View: FunctionalComponent<{}> = ({}) => {
	const selectedLanguage = useSignal(Card.Language.English);

	return (
		<div class={styles.page}>
			<Card.View quotes={quotes} selectedLanguage={selectedLanguage} />
			<hr />
			<div class={styles.reset}>
				<button
					type="button"
					onClick={() => {
						selectedLanguage.value = Card.Language.English;
					}}
				>
					Reset
				</button>
			</div>
		</div>
	);
};
