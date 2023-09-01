import { signal } from '@preact/signals';
import { render, waitFor } from '@testing-library/preact';
import Router from 'preact-router';
import Match from 'preact-router/match';
import { describe, expect, it, vi } from 'vitest';
import { GlobalState, UserType } from './lib/state';
import { AppRouter } from './router';
import { RoutePath, parseRoute } from './router-utils';

vi.mock('preact-router/match');

const mocks = vi.hoisted(() => ({
	Router: vi.fn(),
	ParseRoute: vi.fn()
}));

vi.mock('preact-router', async () => {
	const mod = await vi.importActual<typeof import('preact-router')>('preact-router');
	return {
		...mod,
		default: mocks.Router
	};
});

vi.mock('./router-utils', async () => {
	const mod = await vi.importActual<typeof import('./router-utils')>('./router-utils');
	return {
		...mod,
		parseRoute: mocks.ParseRoute
	};
});

describe('<AppRouter> - render', () => {
	it('registers each route in routeList', () => {
		const routeList = [
			{ path: RoutePath.Home, title: 'whatvv', init: vi.fn(), View: vi.fn() },
			{ path: RoutePath.Pure, title: 'yeah', init: vi.fn(), View: vi.fn() }
		];
		const globalState: GlobalState = {
			user: signal({ userType: UserType.Anonymous }),
			currentRoute: signal({ path: RoutePath.Home })
		};

		mocks.Router.mockImplementation(({ children }) => <>{children}</>);

		render(<AppRouter routeList={routeList} globalState={globalState} />);

		expect(Router).toHaveBeenCalledTimes(1);

		expect(Match).toHaveBeenCalledTimes(2);
		expect(Match).toHaveBeenNthCalledWith(1, expect.objectContaining({ path: RoutePath.Home }), {});
		expect(Match).toHaveBeenNthCalledWith(2, expect.objectContaining({ path: RoutePath.Pure }), {});
	});
});

describe('<AppRouter> - effects', () => {
	it('resets document body on route change', async () => {
		const routeList = [
			{ path: RoutePath.Home, title: 'whatvv', init: vi.fn(), View: vi.fn() },
			{ path: RoutePath.Pure, title: 'yeah', init: vi.fn(), View: vi.fn() }
		];
		const globalState: GlobalState = {
			user: signal({ userType: UserType.Anonymous }),
			currentRoute: signal({ path: RoutePath.Home })
		};

		mocks.Router.mockImplementation(({ onChange }) => {
			setTimeout(() => {
				onChange({});
			}, 1);

			return <></>;
		});

		const { container } = render(<AppRouter routeList={routeList} globalState={globalState} />);
		container.ownerDocument.body.className = 'fwahoghads';
		container.ownerDocument.body.scrollTop = 420;
		container.ownerDocument.documentElement.scrollTop = 421;

		await waitFor(() => {
			expect(container.ownerDocument.body.className).toEqual('');
			expect(container.ownerDocument.body.scrollTop).toEqual(0);
			expect(container.ownerDocument.documentElement.scrollTop).toEqual(0);
		});
	});

	it('parses on route change', async () => {
		const routeList = [
			{ path: RoutePath.Home, title: 'whatvv', init: vi.fn(), View: vi.fn() },
			{ path: RoutePath.Pure, title: 'yeah', init: vi.fn(), View: vi.fn() }
		];
		const globalState: GlobalState = {
			user: signal({ userType: UserType.Anonymous }),
			currentRoute: signal({ path: RoutePath.Home })
		};

		mocks.Router.mockImplementation(({ onChange }) => {
			setTimeout(() => {
				onChange('fwahoghads');
			}, 1);

			return <></>;
		});

		render(<AppRouter routeList={routeList} globalState={globalState} />);

		await waitFor(() => {
			expect(parseRoute).toHaveBeenCalled();
			expect(parseRoute).toHaveBeenCalledWith('fwahoghads');
		});
	});

	it('route change updates global state', async () => {
		const routeList = [
			{ path: RoutePath.Home, title: 'whatvv', init: vi.fn(), View: vi.fn() },
			{ path: RoutePath.Pure, title: 'yeah', init: vi.fn(), View: vi.fn() }
		];
		const globalState: GlobalState = {
			user: signal({ userType: UserType.Anonymous }),
			currentRoute: signal({ path: RoutePath.Home })
		};

		mocks.Router.mockImplementation(({ onChange }) => {
			setTimeout(() => {
				onChange();
			}, 1);

			return <></>;
		});

		mocks.ParseRoute.mockReturnValue('fwahoghads');

		render(<AppRouter routeList={routeList} globalState={globalState} />);

		await waitFor(() => {
			expect(globalState.currentRoute.value).toEqual('fwahoghads');
		});
	});
});
