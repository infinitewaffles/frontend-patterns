import { signal } from '@preact/signals';
import { fireEvent, render, screen, waitFor } from '@testing-library/preact';
import { describe, expect, it, vi } from 'vitest';
import * as Grid from './grid';
import * as Handle from './handle';
import * as Overlay from './overlay';

const mocks = vi.hoisted(() => ({
	OverlayView: vi.fn(),
	HandleView: vi.fn(),
	useHandle: vi.fn()
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
		View: mocks.HandleView
	};
});

vi.mock('./utils', () => ({
	useHandle: mocks.useHandle
}));

describe(`<Grid.View> drag disabled`, async () => {
	type TestRow = Grid.Keyed & {
		name: string;
	};

	it('renders correctly no spatula', async () => {
		const drag = signal<Grid.Drag<TestRow>>({ __style: Grid.DragStyle.None });
		const rows: TestRow[] = [
			{ key: () => 'jake', name: 'Jake' },
			{ key: () => 'marceline', name: 'Marceline' }
		];

		const RowView = vi.fn(({ row }) => <div>{row.name}</div>);
		const MenuView = vi.fn();

		const handle = signal({ state: signal(Handle.SpatulaType.Hidden), idx: -1 });
		mocks.useHandle.mockReturnValue(handle);

		render(<Grid.View rows={rows} drag={drag} RowView={RowView} MenuView={MenuView} />);
		expect(RowView).toHaveBeenCalled();
		expect(RowView).toHaveBeenCalledWith({ row: rows[0], rowIdx: 0 }, expect.anything());
		expect(RowView).toHaveBeenCalledWith({ row: rows[1], rowIdx: 1 }, expect.anything());
		expect(Overlay.View).not.toHaveBeenCalled();
		expect(Handle.View).toHaveBeenCalledWith(
			expect.objectContaining({ state: handle.value.state, children: null }),
			expect.anything()
		);

		const tableRows = await screen.findAllByRole('row');

		expect(tableRows.length).toEqual(3);
		expect(tableRows[0].textContent).toEqual('Table Header');
		expect(tableRows[0].className).toEqual('');
		expect(tableRows[1].textContent).toEqual('Jake');
		expect(tableRows[1].className).toEqual('');
		expect(tableRows[2].textContent).toEqual('Marceline');
		expect(tableRows[2].className).toEqual('');
	});

	it('renders menu', async () => {
		const drag = signal<Grid.Drag<TestRow>>({ __style: Grid.DragStyle.None });
		const rows: TestRow[] = [
			{ key: () => 'jake', name: 'Jake' },
			{ key: () => 'marceline', name: 'Marceline' }
		];

		const RowView = vi.fn(({ row }) => <div>{row.name}</div>);
		const MenuView = vi.fn();

		const handle = signal({ state: signal(Handle.SpatulaType.Menu), idx: 0 });
		mocks.useHandle.mockReturnValue(handle);

		mocks.HandleView.mockImplementation(({ children }) => {
			expect(children).not.toBeNull();
			return null;
		});

		render(<Grid.View rows={rows} drag={drag} RowView={RowView} MenuView={MenuView} />);
		expect(RowView).toHaveBeenCalled();
		expect(RowView).toHaveBeenCalledWith({ row: rows[0], rowIdx: 0 }, expect.anything());
		expect(RowView).toHaveBeenCalledWith({ row: rows[1], rowIdx: 1 }, expect.anything());
		expect(Overlay.View).not.toHaveBeenCalled();
		expect(Handle.View).toHaveBeenCalledWith(
			expect.objectContaining({
				state: handle.value.state
			}),
			expect.anything()
		);

		const tableRows = await screen.findAllByRole('row');

		expect(tableRows.length).toEqual(3);
		expect(tableRows[0].textContent).toEqual('Table Header');
		expect(tableRows[0].className).toEqual('');
		expect(tableRows[1].textContent).toEqual('Jake');
		expect(tableRows[1].className).toEqual('');
		expect(tableRows[2].textContent).toEqual('Marceline');
		expect(tableRows[2].className).toEqual('');
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

		const handle = signal({ state: signal(Handle.SpatulaType.Hidden), idx: -1 });
		mocks.useHandle.mockReturnValue(handle);

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
		expect(Handle.View).toHaveBeenCalledWith(expect.objectContaining({ state: handle.value.state }), expect.anything());
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

		const handle = signal({ state: signal(Handle.SpatulaType.Hidden), idx: -1 });
		mocks.useHandle.mockReturnValue(handle);

		render(<Grid.View rows={rows} drag={drag} RowView={({ row }) => <div>{row.name}</div>} />);

		const tableRows = await screen.findAllByRole('row');
		expect(tableRows.length).toEqual(3);

		const el = tableRows[1];
		fireEvent.mouseEnter(el);

		await waitFor(() => {
			expect(handle.value.idx).toEqual(0);
			expect(handle.value.state.value).toEqual(Handle.SpatulaType.Hovering);
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

		const handle = signal({ state: signal(Handle.SpatulaType.Hovering), idx: 420 });
		mocks.useHandle.mockReturnValue(handle);

		mocks.HandleView.mockImplementation(({ onDragStart }) => {
			setTimeout(() => {
				onDragStart();
			}, 1);
		});

		render(<Grid.View rows={rows} drag={drag} RowView={({ row }) => <div>{row.name}</div>} />);

		await waitFor(() => {
			if (drag.value.__style === Grid.DragStyle.Html) {
				expect(handle.value.idx).toEqual(420);
				expect(drag.value.dragging?.sourceIdx).toEqual(420);
				expect(drag.value.dragging?.destIdx).toEqual(420);
			} else {
				expect.fail();
			}
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

		const handle = signal({ state: signal(Handle.SpatulaType.Dragging), idx: -1 });
		mocks.useHandle.mockReturnValue(handle);

		const onReorder = vi.fn();
		render(<Grid.View rows={rows} drag={drag} RowView={({ row }) => <div>{row.name}</div>} onReorder={onReorder} />);

		const tableRows = await screen.findAllByRole('row');
		expect(tableRows.length).toEqual(3);

		const el = tableRows[1];
		fireEvent.dragOver(el);

		await waitFor(() => {
			if (drag.value.__style === Grid.DragStyle.Html) {
				expect(handle.value.idx).toEqual(0);

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
		});
	});

	it('ends dragging, calls Reorder when order changes, dest > source', async () => {
		const drag = signal<Grid.Drag<TestRow>>({
			__style: Grid.DragStyle.Html,
			ItemView: vi.fn(),
			dragging: { sourceIdx: 420, destIdx: 422 }
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

		const handle = signal({ state: signal(Handle.SpatulaType.Dragging), idx: 421 });
		mocks.useHandle.mockReturnValue(handle);

		const onReorder = vi.fn();
		render(<Grid.View rows={rows} drag={drag} RowView={({ row }) => <div>{row.name}</div>} onReorder={onReorder} />);

		await waitFor(() => {
			if (drag.value.__style === Grid.DragStyle.Html) {
				expect(handle.value.idx).toEqual(421);
				expect(drag.value.dragging).toEqual(undefined);
			} else {
				expect.fail();
			}

			expect(onReorder).toHaveBeenCalled();
			expect(onReorder).toHaveBeenCalledWith({ sourceIdx: 420, destIdx: 421 });
		});
	});

	it('ends dragging, calls Reorder when order changes, dest < source', async () => {
		const drag = signal<Grid.Drag<TestRow>>({
			__style: Grid.DragStyle.Html,
			ItemView: vi.fn(),
			dragging: { sourceIdx: 420, destIdx: 419 }
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

		const handle = signal({ state: signal(Handle.SpatulaType.Dragging), idx: 419 });
		mocks.useHandle.mockReturnValue(handle);

		const onReorder = vi.fn();
		render(<Grid.View rows={rows} drag={drag} RowView={({ row }) => <div>{row.name}</div>} onReorder={onReorder} />);

		await waitFor(() => {
			if (drag.value.__style === Grid.DragStyle.Html) {
				expect(handle.value.idx).toEqual(419);
				expect(drag.value.dragging).toEqual(undefined);
			} else {
				expect.fail();
			}

			expect(onReorder).toHaveBeenCalled();
			expect(onReorder).toHaveBeenCalledWith({ sourceIdx: 420, destIdx: 419 });
		});
	});

	it('ends dragging, does not call Reorder when order is same, dest == source ', async () => {
		const drag = signal<Grid.Drag<TestRow>>({
			__style: Grid.DragStyle.Html,
			ItemView: vi.fn(),
			dragging: { sourceIdx: 420, destIdx: 420 }
		});
		const rows: TestRow[] = [
			{ key: () => 'jake', name: 'Jake' },
			{ key: () => 'marceline', name: 'Marceline' }
		];

		const handle = signal({ state: signal(Handle.SpatulaType.Dragging), idx: 420 });
		mocks.useHandle.mockReturnValue(handle);

		mocks.HandleView.mockImplementation(({ onDragEnd }) => {
			setTimeout(() => {
				onDragEnd();
			}, 1);
		});

		const onReorder = vi.fn();
		render(<Grid.View rows={rows} drag={drag} RowView={({ row }) => <div>{row.name}</div>} onReorder={onReorder} />);

		await waitFor(() => {
			if (drag.value.__style === Grid.DragStyle.Html) {
				expect(handle.value.idx).toEqual(420);
				expect(drag.value.dragging).toEqual(undefined);
			} else {
				expect.fail();
			}

			expect(onReorder).not.toHaveBeenCalled();
		});
	});

	it('ends dragging, does not call Reorder when order is same, dest == source + 1', async () => {
		const drag = signal<Grid.Drag<TestRow>>({
			__style: Grid.DragStyle.Html,
			ItemView: vi.fn(),
			dragging: { sourceIdx: 420, destIdx: 421 }
		});
		const rows: TestRow[] = [
			{ key: () => 'jake', name: 'Jake' },
			{ key: () => 'marceline', name: 'Marceline' }
		];

		const handle = signal({ state: signal(Handle.SpatulaType.Dragging), idx: 420 });
		mocks.useHandle.mockReturnValue(handle);

		mocks.HandleView.mockImplementation(({ onDragEnd }) => {
			setTimeout(() => {
				onDragEnd();
			}, 1);
		});

		const onReorder = vi.fn();
		render(<Grid.View rows={rows} drag={drag} RowView={({ row }) => <div>{row.name}</div>} onReorder={onReorder} />);

		await waitFor(() => {
			if (drag.value.__style === Grid.DragStyle.Html) {
				expect(handle.value.idx).toEqual(420);
				expect(drag.value.dragging).toEqual(undefined);
			} else {
				expect.fail();
			}

			expect(onReorder).not.toHaveBeenCalled();
		});
	});
});
