import './app.css';
import { HelloView } from './hello/hello';

export function App() {
	return (
		<div class="app">
			<HelloView hello="Hello world!" />
		</div>
	);
}
