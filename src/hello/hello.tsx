import { FunctionalComponent } from 'preact';
import './hello.scss';

interface HelloArgs {
	hello: string;
}

export const HelloView: FunctionalComponent<HelloArgs> = ({ hello }) => {
	return <div class="hello">{hello}!</div>;
};
