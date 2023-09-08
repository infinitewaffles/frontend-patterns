import { render, screen } from '@testing-library/preact';
import { describe, expect, it, vi } from 'vitest';
import * as Overlay from './overlay';
import { overlayPosition } from './utils';

vi.mock('./utils');

describe(`<Overlay.View> render`, () => {
	it('renders the overlay view', () => {
		const ItemView = vi.fn();
		render(
			<Overlay.View ItemView={ItemView} row="roh data" wrapperRect={{ top: 420 }} destRect={{ top: 20 }}>
				<div data-testid="chill-drenn"></div>
			</Overlay.View>
		);

		screen.getByTestId('chill-drenn');
		expect(ItemView).toHaveBeenCalled();
		expect(ItemView).toHaveBeenCalledWith({ row: 'roh data' }, expect.anything());
		expect(overlayPosition).toHaveBeenCalled();
		expect(overlayPosition).toHaveBeenCalledWith({ wrapperRect: { top: 420 }, destRect: { top: 20 } });
	});
});
