import { describe, expect, it } from 'vitest';
import { dragPosition } from './grid';

describe('dragPosition', () => {
	it('aligns to lower bound', () => {
		const got = dragPosition({
			wrapperRect: { top: 100 },
			destRect: { top: 99 }
		});

		expect(got).toEqual({ top: 0, left: 0 });
	});

	it('aligns to destRect', () => {
		const got = dragPosition({
			wrapperRect: { top: 100 },
			destRect: { top: 110 }
		});

		expect(got).toEqual({ top: 10, left: 0 });
	});
});
