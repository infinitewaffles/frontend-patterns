import { FunctionalComponent } from 'preact';
import styles from './hello.module.scss';

interface HelloArgs {
	hello: string;
}

export const HelloView: FunctionalComponent<HelloArgs> = ({ hello }) => {
	return <div class={styles.hello}>{hello}!</div>;
};
