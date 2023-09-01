import { signal } from '@preact/signals';
import { render } from '@testing-library/preact';
import { describe, expect, it, vi } from 'vitest';
import { Language } from '../../lib/common';
import { RoutePath } from '../../router-utils';
import { View as CardView } from '../../views/signals/card';
import SignalRoute from './index';

vi.mock('../../views/signals/card');

describe('<SignalRoute.View> - render', () => {
	it('passes correct args to Card', () => {
		const testArgs = {
			route: { path: RoutePath.Signals, args: { language: Language.German } },
			quotes: { mock: 'fwahoghads' }
		} as any;

		render(<SignalRoute.View {...testArgs} />);

		expect(CardView).toHaveBeenCalledTimes(1);
		expect(CardView).toHaveBeenCalledWith(
			expect.objectContaining({
				selectedLanguage: signal(Language.German),
				quotes: { mock: 'fwahoghads' }
			}),
			{}
		);
	});
});

describe('SignalRoute.init', () => {
	it('inits correctly with undefined route', () => {
		const got = SignalRoute.init();
		expect(got?.route.path).toEqual(RoutePath.Signals);
		expect(got?.route.args).toEqual({});
		expect(Object.keys(got?.quotes || {}).length).toEqual(4);
	});

	it('inits correctly', () => {
		const got = SignalRoute.init({ mock: 'fwahoghads' } as any);
		expect(got?.route).toEqual({ mock: 'fwahoghads' });
		expect(Object.keys(got?.quotes || {}).length).toEqual(4);
	});
});
