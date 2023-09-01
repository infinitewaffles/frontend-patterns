import { render } from 'preact';
import './index.scss';
import { getGlobalState } from './lib/state';
import { AppRouter } from './router';

render(<AppRouter globalState={getGlobalState()} />, document.getElementById('root') as HTMLElement);
