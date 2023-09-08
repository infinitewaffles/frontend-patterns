import { describe, expect, it } from 'vitest';
import { dragPosition } from './grid';

describe('dragPosition', () => {
	it('does not set position above the wrapper when mouse is above the wrapper', () => {
		const wrapperRect = { top: 100, height: 200 };
		const destRect = { height: 10 };
		const got = dragPosition(99, wrapperRect, destRect);

		expect(got).toEqual({ top: 0, left: 0 });
	});

	it('does not set position above the wrapper when mouse is near the top edge of wrapper', () => {
		const wrapperRect = { top: 100, height: 200 };
		const destRect = { height: 10 };
		const got = dragPosition(101, wrapperRect, destRect);

		expect(got).toEqual({ top: 0, left: 0 });
	});

	it('sets the position centered against the cursor when not against a boundary', () => {
		const wrapperRect = { top: 100, height: 200 };
		const destRect = { height: 10 };
		const got = dragPosition(106, wrapperRect, destRect);

		expect(got).toEqual({ top: 1, left: 0 });
	});

	it('does not set position below the wrapper when mouse is below the wrapper', () => {
		const wrapperRect = { top: 100, height: 200 };
		const destRect = { height: 10 };
		const got = dragPosition(301, wrapperRect, destRect);

		expect(got).toEqual({ bottom: 0, left: 0 });
	});

	it('does not set position below the wrapper when mouse is near the bottom edge of the wrapper', () => {
		const wrapperRect = { top: 100, height: 200 };
		const destRect = { height: 10 };
		const got = dragPosition(296, wrapperRect, destRect);

		expect(got).toEqual({ bottom: 0, left: 0 });
	});
});
