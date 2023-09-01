import { signal } from '@preact/signals';
import { renderHook, waitFor } from '@testing-library/preact';
import { describe, expect, it, vi } from 'vitest';
import { useGlobalState } from './hooks';
import { User, UserType } from './state';

const mocks = vi.hoisted(() => ({
	GetGlobalState: vi.fn()
}));

vi.mock('./state', async () => {
	const mod = await vi.importActual<typeof import('./state')>('./state');
	return {
		...mod,
		getGlobalState: mocks.GetGlobalState
	};
});

describe('useGlobalState', () => {
	it('should be up-to-date when global value is changed', async () => {
		const user = signal<User>({ userType: UserType.Anonymous });
		const currentRoute = signal({ path: 'fwahoghads' });
		mocks.GetGlobalState.mockReturnValue({ user, currentRoute });

		const { result } = renderHook(() => useGlobalState());

		expect(result.current.user).toEqual({ userType: UserType.Anonymous });
		expect(result.current.currentRoute).toEqual({ path: 'fwahoghads' });

		user.value = { userType: UserType.Authenticated, name: 'Bob Marley' };

		await waitFor(() => {
			expect(result.current.user).toEqual({ userType: UserType.Authenticated, name: 'Bob Marley' });
			expect(result.current.currentRoute).toEqual({ path: 'fwahoghads' });
		});
	});
});
