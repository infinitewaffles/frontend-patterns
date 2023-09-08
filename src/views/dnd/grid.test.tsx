import { signal } from '@preact/signals';
import { fireEvent, render, screen, waitFor } from '@testing-library/preact';
import { describe, expect, it, vi } from 'vitest';
import * as Grid from './grid';
import * as Handle from './handle';
import * as Overlay from './overlay';

const mocks = vi.hoisted(() => ({
	OverlayView: vi.fn(),
	HandleView: vi.fn(),
	useHandle: vi.fn(),
	useHandleIndex: vi.fn()
}));

vi.mock('./overlay', async () => {
	const mod = await vi.importActual<typeof import('./overlay')>('./overlay');
	return {
		...mod,
		View: mocks.OverlayView
	};
});

vi.mock('./handle', async () => {
	const mod = await vi.importActual<typeof import('./handle')>('./handle');
	return {
		...mod,
		useHandle: mocks.useHandle,
		View: mocks.HandleView
	};
});

vi.mock('./utils', () => ({
	useHandleIndex: mocks.useHandleIndex
}));

describe(`<Grid.View> drag disabled`, async () => {
	type TestRow = Grid.Keyed & {
		name: string;
	};

	it('renders correctly', async () => {
		const drag = signal<Grid.Drag<TestRow>>({ __style: Grid.DragStyle.None });
		const rows: TestRow[] = [
			{ key: () => 'jake', name: 'Jake' },
			{ key: () => 'marceline', name: 'Marceline' }
		];

		const handle = signal(Handle.SpatulaType.Hidden);
		mocks.useHandle.mockReturnValue(handle);
		mocks.useHandleIndex.mockReturnValue(signal(-1));

		render(<Grid.View rows={rows} drag={drag} RowView={({ row }) => <div>{row.name}</div>} />);
		const tableRows = await screen.findAllByRole('row');

		expect(tableRows.length).toEqual(3);
		expect(tableRows[0].textContent).toEqual('Table Header');
		expect(tableRows[0].className).toEqual('');
		expect(tableRows[1].textContent).toEqual('Jake');
		expect(tableRows[1].className).toEqual('');
		expect(tableRows[2].textContent).toEqual('Marceline');
		expect(tableRows[2].className).toEqual('');
		expect(Overlay.View).not.toHaveBeenCalled();
		expect(Handle.View).toHaveBeenCalled();
		expect(Handle.View).toHaveBeenCalledWith(expect.objectContaining({ state: handle }), expect.anything());
	});
});

describe(`<Grid.View> drag with html overlay`, async () => {
	type TestRow = Grid.Keyed & {
		name: string;
	};

	it('renders with everything closed', async () => {
		const drag = signal<Grid.Drag<TestRow>>({
			__style: Grid.DragStyle.Html,
			ItemView: vi.fn()
		});
		const rows: TestRow[] = [
			{ key: () => 'jake', name: 'Jake' },
			{ key: () => 'marceline', name: 'Marceline' }
		];

		const handle = signal({
			spatulaType: Handle.SpatulaType.Hidden,
			targetRect: { top: 0, left: 0, height: 0 }
		});
		mocks.useHandle.mockReturnValue(handle);
		mocks.useHandleIndex.mockReturnValue(signal(-1));

		render(<Grid.View rows={rows} drag={drag} RowView={({ row }) => <div>{row.name}</div>} />);

		const tableRows = await screen.findAllByRole('row');
		expect(tableRows.length).toEqual(3);
		expect(tableRows[0].textContent).toEqual('Table Header');
		expect(tableRows[0].className).toEqual('');
		expect(tableRows[1].textContent).toEqual('Jake');
		expect(tableRows[1].className).toEqual('');
		expect(tableRows[2].textContent).toEqual('Marceline');
		expect(tableRows[2].className).toEqual('');
		expect(Overlay.View).not.toHaveBeenCalled();
		expect(Handle.View).toHaveBeenCalled();
		expect(Handle.View).toHaveBeenCalledWith(expect.objectContaining({ state: handle }), expect.anything());
	});

	it('mouseEnter shows hover handle', async () => {
		const drag = signal<Grid.Drag<TestRow>>({
			__style: Grid.DragStyle.Html,
			ItemView: vi.fn()
		});
		const rows: TestRow[] = [
			{ key: () => 'jake', name: 'Jake' },
			{ key: () => 'marceline', name: 'Marceline' }
		];
		const handle = signal({
			spatulaType: Handle.SpatulaType.Hidden,
			targetRect: { top: 0, left: 0, height: 0 }
		});
		mocks.useHandle.mockReturnValue(handle);

		const handleIndex = signal(-1);
		mocks.useHandleIndex.mockReturnValue(handleIndex);

		render(<Grid.View rows={rows} drag={drag} RowView={({ row }) => <div>{row.name}</div>} />);

		const tableRows = await screen.findAllByRole('row');
		expect(tableRows.length).toEqual(3);

		const el = tableRows[1];
		fireEvent.mouseEnter(el);

		await waitFor(() => {
			expect(handleIndex.value).toEqual(0);
			expect(Overlay.View).not.toHaveBeenCalled();
			expect(Handle.View).toHaveBeenCalled();
			expect(Handle.View).toHaveBeenCalledWith(expect.objectContaining({ state: handle }), expect.anything());
		});
	});

	it('starts dragging', async () => {
		const drag = signal<Grid.Drag<TestRow>>({
			__style: Grid.DragStyle.Html,
			ItemView: vi.fn()
		});
		const rows: TestRow[] = [
			{ key: () => 'jake', name: 'Jake' },
			{ key: () => 'marceline', name: 'Marceline' }
		];

		const handle = signal({
			spatulaType: Handle.SpatulaType.Hovering,
			targetRect: { top: 0, left: 0, height: 0 }
		});
		mocks.useHandle.mockReturnValue(handle);

		const handleIndex = signal(420);
		mocks.useHandleIndex.mockReturnValue(handleIndex);

		mocks.HandleView.mockImplementation(({ onDragStart }) => {
			setTimeout(() => {
				onDragStart();
			}, 1);
		});

		render(<Grid.View rows={rows} drag={drag} RowView={({ row }) => <div>{row.name}</div>} />);

		await waitFor(() => {
			if (drag.value.__style === Grid.DragStyle.Html) {
				expect(handleIndex.value).toEqual(420);
				expect(drag.value.dragging?.sourceIdx).toEqual(420);
				expect(drag.value.dragging?.destIdx).toEqual(420);
			} else {
				expect.fail();
			}

			expect(Overlay.View).toHaveBeenCalled();
			expect(Handle.View).toHaveBeenCalled();
			expect(Handle.View).toHaveBeenCalledWith(expect.objectContaining({ state: handle }), expect.anything());
		});
	});

	it('onDragOver updates destIdx', async () => {
		const drag = signal<Grid.Drag<TestRow>>({
			__style: Grid.DragStyle.Html,
			ItemView: vi.fn(),
			dragging: { sourceIdx: 420, destIdx: 420 }
		});
		const rows: TestRow[] = [
			{ key: () => 'jake', name: 'Jake' },
			{ key: () => 'marceline', name: 'Marceline' }
		];

		const handle = signal({
			spatulaType: Handle.SpatulaType.Dragging,
			targetRect: { top: 0, left: 0, height: 0 }
		});
		mocks.useHandle.mockReturnValue(handle);

		const handleIndex = signal(undefined);
		mocks.useHandleIndex.mockReturnValue(handleIndex);

		const onReorder = vi.fn();
		render(<Grid.View rows={rows} drag={drag} RowView={({ row }) => <div>{row.name}</div>} onReorder={onReorder} />);

		const tableRows = await screen.findAllByRole('row');
		expect(tableRows.length).toEqual(3);

		const el = tableRows[1];
		fireEvent.dragOver(el);

		await waitFor(() => {
			if (drag.value.__style === Grid.DragStyle.Html) {
				expect(handleIndex.value).toEqual(0);

				if (drag.value.dragging) {
					expect(drag.value.dragging.sourceIdx).toEqual(420);
					expect(drag.value.dragging.destIdx).toEqual(0);
				} else {
					expect.fail();
				}
			} else {
				expect.fail();
			}

			expect(onReorder).not.toHaveBeenCalled();
			expect(Overlay.View).toHaveBeenCalled();
			expect(Handle.View).toHaveBeenCalled();
			expect(Handle.View).toHaveBeenCalledWith(expect.objectContaining({ state: handle }), expect.anything());
		});
	});

	it('ends dragging, calls Reorder when order is different', async () => {
		const drag = signal<Grid.Drag<TestRow>>({
			__style: Grid.DragStyle.Html,
			ItemView: vi.fn(),
			dragging: { sourceIdx: 420, destIdx: 421 }
		});
		const rows: TestRow[] = [
			{ key: () => 'jake', name: 'Jake' },
			{ key: () => 'marceline', name: 'Marceline' }
		];

		mocks.HandleView.mockImplementation(({ onDragEnd }) => {
			setTimeout(() => {
				onDragEnd();
			}, 1);
		});

		const handle = signal({
			spatulaType: Handle.SpatulaType.Dragging,
			targetRect: { top: 0, left: 0, height: 0 }
		});
		mocks.useHandle.mockReturnValue(handle);

		const handleIndex = signal(421);
		mocks.useHandleIndex.mockReturnValue(handleIndex);

		const onReorder = vi.fn();
		render(<Grid.View rows={rows} drag={drag} RowView={({ row }) => <div>{row.name}</div>} onReorder={onReorder} />);

		await waitFor(() => {
			if (drag.value.__style === Grid.DragStyle.Html) {
				expect(handleIndex.value).toEqual(421);
				expect(drag.value.dragging).toEqual(undefined);
			} else {
				expect.fail();
			}

			expect(onReorder).toHaveBeenCalled();
			expect(onReorder).toHaveBeenCalledWith({ sourceIdx: 420, destIdx: 421 });
			expect(Overlay.View).toHaveBeenCalled();
			expect(Handle.View).toHaveBeenCalled();
			expect(Handle.View).toHaveBeenCalledWith(expect.objectContaining({ state: handle }), expect.anything());
		});
	});

	it('ends dragging, does not call Reorder when order is same', async () => {
		const drag = signal<Grid.Drag<TestRow>>({
			__style: Grid.DragStyle.Html,
			ItemView: vi.fn(),
			dragging: { sourceIdx: 420, destIdx: 420 }
		});
		const rows: TestRow[] = [
			{ key: () => 'jake', name: 'Jake' },
			{ key: () => 'marceline', name: 'Marceline' }
		];

		const handle = signal({
			spatulaType: Handle.SpatulaType.Dragging,
			targetRect: { top: 0, left: 0, height: 0 }
		});
		mocks.useHandle.mockReturnValue(handle);

		const handleIndex = signal(420);
		mocks.useHandleIndex.mockReturnValue(handleIndex);

		mocks.HandleView.mockImplementation(({ onDragEnd }) => {
			setTimeout(() => {
				onDragEnd();
			}, 1);
		});

		const onReorder = vi.fn();
		render(<Grid.View rows={rows} drag={drag} RowView={({ row }) => <div>{row.name}</div>} onReorder={onReorder} />);

		await waitFor(() => {
			if (drag.value.__style === Grid.DragStyle.Html) {
				expect(handleIndex.value).toEqual(420);
				expect(drag.value.dragging).toEqual(undefined);
			} else {
				expect.fail();
			}

			expect(onReorder).not.toHaveBeenCalled();
			expect(Overlay.View).toHaveBeenCalled();
			expect(Handle.View).toHaveBeenCalled();
			expect(Handle.View).toHaveBeenCalledWith(expect.objectContaining({ state: handle }), expect.anything());
		});
	});
});
