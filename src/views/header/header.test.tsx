import { render, screen } from '@testing-library/preact';
import { describe, expect, it, vi } from 'vitest';
import { UserType } from '../../lib/state';
import { Header } from './header';

const mocks = vi.hoisted(() => ({
	UseGlobalState: vi.fn()
}));

vi.mock('../../lib/hooks', async () => {
	const mod = await vi.importActual<typeof import('../../lib/hooks')>('../../lib/hooks');
	return {
		...mod,
		useGlobalState: mocks.UseGlobalState
	};
});

describe('<Header> - render', () => {
	it('renders anonymous user', () => {
		mocks.UseGlobalState.mockImplementation(() => ({ user: { userType: UserType.Anonymous } }));

		const { container } = render(<Header onSignIn={vi.fn()} onSignOut={vi.fn()} />);
		expect(container.getElementsByTagName('button').length).toEqual(1);
		expect(container.getElementsByTagName('button')[0].textContent).toEqual('Sign In');
	});

	it('renders authenticated user', () => {
		mocks.UseGlobalState.mockImplementation(() => ({ user: { userType: UserType.Authenticated, name: 'fwahoghads' } }));

		const { container } = render(<Header onSignIn={vi.fn()} onSignOut={vi.fn()} />);
		expect(container.getElementsByTagName('button').length).toEqual(1);
		expect(container.getElementsByTagName('button')[0].textContent).toEqual('Sign Out');
		expect(() => screen.getByText('fwahoghads')).not.toThrow();
	});
});
