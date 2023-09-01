import { render } from 'preact';
import './index.scss';
import { AppRouter } from './router';

render(<AppRouter />, document.getElementById('root') as HTMLElement);
