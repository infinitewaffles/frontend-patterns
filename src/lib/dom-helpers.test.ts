import { describe, expect, it } from 'vitest';
import { MaybeClass, classIf } from './dom-helpers';

describe('class if', () => {
	const tests: { args: MaybeClass[]; want: string }[] = [
		{ args: [], want: '' },
		{ args: [['fwahoghads']], want: 'fwahoghads' },
		{ args: [['fwahoghads', false]], want: '' },
		{ args: [['fwahoghads', true]], want: 'fwahoghads' },

		{ args: [['uno'], ['dos'], ['tres']], want: 'uno dos tres' },
		{
			args: [
				['uno', true],
				['dos', false],
				['tres', true]
			],
			want: 'uno tres'
		}
	];

	tests.forEach((t) =>
		it(`tests ${t.args}`, () => {
			expect(classIf(t.args)).toEqual(t.want);
		})
	);
});
