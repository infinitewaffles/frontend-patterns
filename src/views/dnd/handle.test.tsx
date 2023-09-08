import { signal } from '@preact/signals';
import { fireEvent, render, screen, waitFor } from '@testing-library/preact';
import { describe, expect, it, vi } from 'vitest';
import * as Handle from './handle';
import { spatulaPosition } from './utils';

const mocks = vi.hoisted(() => ({
	spatulaPosition: vi.fn()
}));

vi.mock('./utils', () => ({
	spatulaPosition: mocks.spatulaPosition
}));

describe(`<Handle.View> - hover handle`, () => {
	it('renders correctly', () => {
		mocks.spatulaPosition.mockReturnValue({ top: 420, left: 421 });
		const state = signal(Handle.SpatulaType.Hovering);

		const { container } = render(<Handle.View state={state} targetRect={{} as any} />);
		const handle = container.getElementsByClassName('handle')[0];

		expect(spatulaPosition).toHaveBeenCalled();
		expect(handle.getAttribute('draggable')).toEqual('true');
		expect(handle.getAttribute('style')).toEqual('top: 420px; left: 421px;');
	});

	it('calls onOpenMenu', () => {
		const onOpenMenu = vi.fn();
		const state = signal(Handle.SpatulaType.Hovering);

		const { container } = render(<Handle.View state={state} targetRect={{} as any} onOpenMenu={onOpenMenu} />);
		const handle = container.getElementsByClassName('handle')[0];
		fireEvent.click(handle);

		expect(onOpenMenu).toHaveBeenCalled();
		expect(state.value).toEqual(Handle.SpatulaType.Menu);
	});

	it('calls onDragStart', async () => {
		const onDragStart = vi.fn();
		const state = signal(Handle.SpatulaType.Hovering);

		const { container } = render(<Handle.View state={state} targetRect={{} as any} onDragStart={onDragStart} />);
		const handle = container.getElementsByClassName('handle')[0];
		fireEvent.dragStart(handle);

		await waitFor(() => {
			expect(onDragStart).toHaveBeenCalled();
			expect(state.value).toEqual(Handle.SpatulaType.Dragging);
		});
	});
});

describe(`<Handle.View> - drag handle`, () => {
	it('renders correctly', () => {
		mocks.spatulaPosition.mockReturnValue({ top: 420, left: 421 });
		const state = signal(Handle.SpatulaType.Dragging);

		const { container } = render(<Handle.View state={state} targetRect={{} as any} />);
		const handle = container.getElementsByClassName('handle')[0];

		expect(spatulaPosition).toHaveBeenCalled();
		expect(handle.getAttribute('draggable')).toEqual('true');
		expect(handle.getAttribute('style')).toEqual('top: 420px; left: 421px;');
	});

	it('calls onDragEnd', async () => {
		const onDragEnd = vi.fn();
		const state = signal(Handle.SpatulaType.Dragging);

		const { container } = render(<Handle.View state={state} targetRect={{} as any} onDragEnd={onDragEnd} />);
		const handle = container.getElementsByClassName('handle')[0];
		fireEvent.dragEnd(handle);

		await waitFor(() => {
			expect(onDragEnd).toHaveBeenCalled();
			expect(state.value).toEqual(Handle.SpatulaType.Hovering);
		});
	});
});

describe(`<Handle.View> - menu handle`, () => {
	it('renders correctly', async () => {
		mocks.spatulaPosition.mockReturnValue({ top: 420, left: 421 });
		const state = signal(Handle.SpatulaType.Menu);

		const { container } = render(
			<Handle.View state={state} targetRect={{} as any}>
				<div data-testid="menyou"></div>
			</Handle.View>
		);
		const handle = container.getElementsByClassName('handle')[0];
		await screen.getByTestId('menyou');

		expect(spatulaPosition).toHaveBeenCalled();
		expect(handle.getAttribute('draggable')).toBeFalsy();
		expect(handle.getAttribute('style')).toEqual('top: 420px; left: 421px;');
	});

	it('calls onCloseMenu', () => {
		const onCloseMenu = vi.fn();
		const state = signal(Handle.SpatulaType.Menu);

		const { container } = render(<Handle.View state={state} targetRect={{} as any} onCloseMenu={onCloseMenu} />);
		const handle = container.getElementsByClassName('handle')[0];
		fireEvent.click(handle);

		expect(onCloseMenu).toHaveBeenCalled();
		expect(state.value).toEqual(Handle.SpatulaType.Hovering);
	});
});
