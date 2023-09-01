import { render } from '@testing-library/preact';
import { describe, expect, it, vi } from 'vitest';
import { Language } from '../../lib/common';
import { RoutePath } from '../../router-utils';
import { View as CardView } from '../../views/pure/card';
import PureRoute from './index';

vi.mock('../../views/pure/card');

describe('<SignalRoute.View> - render', () => {
	it('passes correct args to Card', () => {
		const testArgs = {
			route: { path: RoutePath.Pure, args: { language: Language.German } },
			quotes: { mock: 'fwahoghads' }
		} as any;

		render(<PureRoute.View {...testArgs} />);

		expect(CardView).toHaveBeenCalledTimes(1);
		expect(CardView).toHaveBeenCalledWith(
			expect.objectContaining({
				selectedLanguage: Language.German,
				quotes: { mock: 'fwahoghads' }
			}),
			{}
		);
	});
});

describe('SignalRoute.init', () => {
	it('inits correctly with undefined route', () => {
		const got = PureRoute.init();
		expect(got?.route.path).toEqual(RoutePath.Pure);
		expect(got?.route.args).toEqual({});
		expect(Object.keys(got?.quotes || {}).length).toEqual(4);
	});

	it('inits correctly', () => {
		const got = PureRoute.init({ mock: 'fwahoghads' } as any);
		expect(got?.route).toEqual({ mock: 'fwahoghads' });
		expect(Object.keys(got?.quotes || {}).length).toEqual(4);
	});
});
