import { RouterOnChangeArgs } from 'preact-router';
import { describe, expect, it } from 'vitest';
import { Language } from './lib/common';
import { AppRoute, RoutePath, generateUrl, parseRoute } from './router-utils';

describe('parseRoute', () => {
	const tests = [
		{
			args: { url: '/', path: '/', matches: {} },
			want: { path: RoutePath.Home }
		},
		{
			args: { url: '/fwahoghads', path: '/fwahoghads', matches: {} },
			want: { path: RoutePath.Home }
		},
		{
			args: { url: '/pure/en', path: RoutePath.Pure, matches: { language: 'en' } },
			want: { path: RoutePath.Pure, args: { language: Language.English } }
		},
		{
			args: { url: '/pure/en', path: RoutePath.Pure, matches: { language: 'sp' } },
			want: { path: RoutePath.Pure, args: { language: Language.Spanish } }
		},
		{
			args: { url: '/signals', path: RoutePath.Signals, matches: {} },
			want: { path: RoutePath.Signals, args: { language: Language.English } }
		},
		{
			args: { url: '/signals?l=de', path: RoutePath.Signals, matches: {} },
			want: { path: RoutePath.Signals, args: { language: Language.German } }
		}
	];

	tests.forEach((t) => {
		it(`parses route: ${t.args.url}`, () => {
			expect(parseRoute(t.args as RouterOnChangeArgs)).toEqual(t.want);
		});
	});
});

describe('generateUrl', () => {
	const tests = [
		{
			args: { path: RoutePath.Home },
			want: '/'
		},
		{
			args: { path: RoutePath.Pure, args: {} },
			want: '/pure/en'
		},
		{
			args: { path: RoutePath.Pure, args: { language: Language.Spanish } },
			want: '/pure/sp'
		},
		{
			args: { path: RoutePath.Signals, args: {} },
			want: '/signals?l=en'
		},
		{
			args: { path: RoutePath.Signals, args: { language: Language.German } },
			want: '/signals?l=de'
		}
	];

	tests.forEach((t) => {
		it(`generates url: ${JSON.stringify(t.args)}`, () => {
			expect(generateUrl(t.args as AppRoute)).toEqual(t.want);
		});
	});
});
