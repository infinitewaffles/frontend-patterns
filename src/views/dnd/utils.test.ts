import { describe, expect, it } from 'vitest';
import { overlayPosition, spatulaPosition } from './utils';

describe('overlayPosition', () => {
	it('aligns to lower bound', () => {
		const got = overlayPosition({
			wrapperRect: { top: 100 },
			destRect: { top: 99 }
		});

		expect(got).toEqual({ top: 0, left: 0 });
	});

	it('aligns to destRect', () => {
		const got = overlayPosition({
			wrapperRect: { top: 100 },
			destRect: { top: 110 }
		});

		expect(got).toEqual({ top: 10, left: 0 });
	});
});

describe('spatulaPosition', () => {
	it('aligns to lower bound', () => {
		const got = spatulaPosition({
			targetRect: { top: 10, left: 20, height: 40 },
			spatulaRect: { width: 8, height: 10 }
		});

		expect(got).toEqual({ top: 25, left: 16 });
	});
});
