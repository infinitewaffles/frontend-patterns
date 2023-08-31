import { Signal } from '@preact/signals';
import { FunctionalComponent } from 'preact';
import { useEffect } from 'preact/hooks';
import { enumKeys } from '../lib/helpers';
import styles from './card.module.scss';

export enum Language {
	English,
	Spanish,
	French,
	German
}

const languages = enumKeys(Language);

// Args are properties that are passed from the parent component.
// These properties are either static or managed by the caller.
interface Args {
	quotes: Record<Language, string>;
}

// State is the mutable data for the component.
// Since they are signals, both the parent and the component can mutate them.
// This is what a reducer function would act upon.
interface State {
	selectedLanguage: Signal<Language>;
}

// These are callbacks that inform the parent of an event.
// It is common for components to mutate state for multiple reasons.
// It is a good practice to add event handlers when the intent of a change is important.
// Since the parent has access to the shared state signal, there is no reason for the callback to send the state as an arg.
interface EventHandlers {
	onChangeLanguage?: () => void;
	onNextLanguage?: () => void;
}

export const View: FunctionalComponent<Args & State & EventHandlers> = ({
	selectedLanguage,
	quotes,
	onChangeLanguage,
	onNextLanguage
}) => {
	useEffect(() => {
		const keyfn = (e: KeyboardEvent) => {
			if (e.code === 'ArrowRight') {
				const nextIdx = languages.findIndex((k) => Language[k] === selectedLanguage.value) + 1;

				if (nextIdx >= languages.length) {
					selectedLanguage.value = Language[languages[0]];
				} else {
					selectedLanguage.value = Language[languages[nextIdx]];
				}

				onNextLanguage && onNextLanguage();
			}
		};
		document.addEventListener('keyup', keyfn, false);

		return () => {
			document.removeEventListener('keyup', keyfn, false);
		};
	}, []);

	return (
		<div class={styles.card}>
			<div class={styles.top}>
				{languages.map((k) => (
					<button
						type="button"
						class={Language[k] === selectedLanguage.value ? styles.selected : ''}
						onClick={() => {
							selectedLanguage.value = Language[k];
							onChangeLanguage && onChangeLanguage();
						}}
					>
						{k}
					</button>
				))}
			</div>
			<div class={styles.bottom}>{quotes[selectedLanguage.value]}</div>
		</div>
	);
};
