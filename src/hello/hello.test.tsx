import { render } from '@testing-library/preact';
import { describe, expect, it } from 'vitest';
import { HelloView } from './hello';

describe('HelloView - render', () => {
	const tests = [
		{
			args: { hello: 'Hello world' },
			want: 'Hello world!'
		},
		{
			args: { hello: 'Hola Mundo' },
			want: 'Hola Mundo!'
		}
	];

	tests.forEach((t) => {
		it('renders correctly', () => {
			const { container } = render(<HelloView {...t.args} />);
			const got = container.getElementsByClassName('hello').item(0);

			expect(got?.textContent).toEqual(t.want);
		});
	});
});
