import { FunctionalComponent } from 'preact';
import { enumKeys } from '../lib/helpers';
import styles from './card.module.scss';

export enum Language {
	English,
	Spanish,
	French,
	German
}

interface Args {
	quotes: Record<Language, string>;
	selectedLanguage: Language;
}

interface EventHandlers {
	onChangeLanguage: (lang: Language) => void;
}

export const View: FunctionalComponent<Args & EventHandlers> = ({ selectedLanguage, quotes, onChangeLanguage }) => {
	return (
		<div class={styles.card}>
			<div class={styles.top}>
				{enumKeys(Language).map((k) => (
					<button
						class={Language[k] === selectedLanguage ? styles.selected : ''}
						type="button"
						onClick={() => onChangeLanguage(Language[k])}
					>
						{k}
					</button>
				))}
			</div>
			<div class={styles.bottom}>{quotes[selectedLanguage]}</div>
		</div>
	);
};
