import { signal } from '@preact/signals';
import { fireEvent, render } from '@testing-library/preact';
import { describe, expect, it, vi } from 'vitest';
import { CellViewArgs, Grid, ValueKey } from './grid';

describe('Grid<object, object, number>', () => {
	type TestRow = { id: number; label: string; key: () => string };
	type TestColumn = { key: string; title: string };
	type TestValue = number;

	const columns: TestColumn[] = [
		{ key: 'col1', title: 'bleep' },
		{ key: 'col2', title: 'gleek' }
	];
	const rows: TestRow[] = [
		{ id: 3, label: 'floop', key: () => 'a' },
		{ id: 4, label: 'pork', key: () => 'b' },
		{ id: 5, label: 'waffles', key: () => 'c' }
	];
	const hashFn = ({ row, column }: ValueKey<TestRow, TestColumn>) => `${column.key}-row${row.id}`;
	const values: Record<string, TestValue> = {
		'col1-row3': -100,
		'col1-row4': -200,
		'col1-row5': -300,
		'col2-row3': -400,
		'col2-row4': -500,
		'col2-row5': -600
	};

	const wantCellArgs: CellViewArgs<TestRow, TestColumn, TestValue>[] = [
		{ row: rows[0], column: columns[0], cell: -100 },
		{ row: rows[0], column: columns[1], cell: -400 },
		{ row: rows[1], column: columns[0], cell: -200 },
		{ row: rows[1], column: columns[1], cell: -500 },
		{ row: rows[2], column: columns[0], cell: -300 },
		{ row: rows[2], column: columns[1], cell: -600 }
	];

	it('calls injected render functions', () => {
		const spyRow = vi.fn();
		const spyCol = vi.fn();
		const spyVal = vi.fn();
		const testArgs = {
			columns,
			rows,
			values,
			hash: hashFn,
			RowLabelView: spyRow,
			ColumnView: spyCol,
			CellView: spyVal
		};

		render(<Grid {...testArgs} />);

		expect(spyRow).toHaveBeenCalledTimes(testArgs.rows.length);
		testArgs.rows.forEach((row, rowIdx) => expect(spyRow).toHaveBeenCalledWith({ row, rowIdx }, {}));

		expect(spyCol).toHaveBeenCalledTimes(testArgs.columns.length + 1);
		expect(spyCol).toHaveBeenCalledWith({ columnIdx: -1 }, {});
		testArgs.columns.forEach((column, columnIdx) => expect(spyCol).toHaveBeenCalledWith({ column, columnIdx }, {}));

		expect(spyVal).toHaveBeenCalledTimes(wantCellArgs.length);
		wantCellArgs.forEach((a) => expect(spyVal).toHaveBeenCalledWith(a, {}));
	});

	it(`renders correctly`, () => {
		const t = {
			args: {
				columns,
				rows,
				values,
				hash: hashFn,
				ColumnView: ({ column }: { column?: TestColumn }) => <>{column ? `abc - ${column.title}` : '--'}</>,
				RowLabelView: ({ row }: { row: TestRow }) => <>{`xyz - ${row.label}`}</>,
				CellView: ({ cell }: { cell?: TestValue }) => <>{cell?.toFixed(2) || 'err'}</>
			},
			want: {
				columns: ['--', 'abc - bleep', 'abc - gleek'],
				rows: [
					['xyz - floop', '-100.00', '-400.00'],
					['xyz - pork', '-200.00', '-500.00'],
					['xyz - waffles', '-300.00', '-600.00']
				]
			}
		};

		const { container } = render(<Grid {...t.args} />);
		const got = container.children.item(0);

		expect(got).not.toBeNull();
		if (got) {
			t.want.columns.forEach((c, i) => expect(got.getElementsByTagName('th').item(i)?.textContent).toEqual(c));

			const gotBody = got.getElementsByTagName('tbody').item(0);
			expect(gotBody).not.toBeNull();

			const gotRows = gotBody?.getElementsByTagName('tr');
			expect(gotRows?.length).toEqual(t.want.rows.length);

			if (gotRows) {
				t.want.rows.forEach((vals, i) => {
					const gotRow = gotRows.item(i);
					expect(gotRow).not.toBeNull();

					vals.forEach((v, j) => expect(gotRow?.children.item(j)?.textContent).toEqual(v));
				});
			}
		}
	});

	it(`emits keyed rows`, () => {
		const t = {
			args: {
				columns: [],
				rows: [
					{ id: 3, label: 'floop', key: () => 'key999' },
					{ id: 4, label: 'pork', key: () => 'key888' }
				],
				values: {},
				hash: hashFn,
				ColumnView: vi.fn(),
				RowLabelView: vi.fn(),
				CellView: vi.fn()
			},
			want: [{ key: 'key999' }, { key: 'key888' }]
		};

		const { container } = render(<Grid {...t.args} />);
		const gotRows = container.getElementsByTagName('tbody').item(0)?.getElementsByTagName('tr');
		expect(gotRows).not.toBeNull();

		if (gotRows) {
			expect(gotRows.length).toEqual(t.want.length);

			// HACK - this is a proxy for preact key attribute.
			// cannot see how to access the key without something like enzyme which ios deprecated.
			t.want.forEach((w, i) => expect(gotRows.item(i)?.getAttribute('data-key')).toEqual(w.key));
		}
	});

	it('adds the css wrapper class', () => {
		const testArgs = {
			cssWrapperClass: 'asdf',
			columns,
			rows,
			values,
			hash: hashFn,
			RowLabelView: vi.fn(),
			ColumnView: vi.fn(),
			CellView: vi.fn()
		};

		const { container } = render(<Grid {...testArgs} />);
		const got = container.children.item(0);

		expect(got).not.toBeNull();
		if (got) {
			expect(got.classList.contains('asdf')).toBeTruthy();
		}
	});

	describe('drag and drop', () => {
		const rows = [
			{ id: 3, label: 'floop', key: () => 'key999' },
			{ id: 4, label: 'pork', key: () => 'key888' }
		];
		const args = {
			columns: [],
			rows,
			values: {},
			hash: hashFn,
			ColumnView: vi.fn(),
			RowLabelView: vi.fn(),
			CellView: vi.fn()
		};

		it('should NOT make table rows draggable when drag is not passed', () => {
			const t = {
				args
			};

			const { container } = render(<Grid {...t.args} />);
			const rows = container.getElementsByTagName('tbody')[0].getElementsByTagName('tr');

			for (let row of rows) {
				expect(row.getAttribute('draggable')).toBeFalsy();
			}
		});

		it('should make table rows draggable when drag is passed as prop', () => {
			const t = {
				args: {
					...args,
					drag: signal(undefined)
				}
			};

			const { container } = render(<Grid {...t.args} />);
			const rows = container.getElementsByTagName('tbody')[0].getElementsByTagName('tr');

			for (let row of rows) {
				expect(row.getAttribute('draggable')).toEqual('true');
			}
		});

		it('should make table rows draggable while dragging', () => {
			const t = {
				args: {
					...args,
					drag: signal({ dragIdx: 0, overIdx: 1 })
				}
			};

			const { container } = render(<Grid {...t.args} />);
			const rows = container.getElementsByTagName('tbody')[0].getElementsByTagName('tr');

			for (let row of rows) {
				expect(row.getAttribute('draggable')).toEqual('true');
			}
		});

		it('should set initial drag data when drag begins', () => {
			const s = { dragIdx: 0, overIdx: 0 };
			const drag = signal(undefined);
			const t = {
				args: {
					...args,
					drag
				}
			};

			const { container } = render(<Grid {...t.args} />);
			const rows = container.getElementsByTagName('tbody')[0].getElementsByTagName('tr');

			fireEvent.dragStart(rows[0]);

			expect(drag.value).toEqual(s);
		});

		it('should change drag to reflect overIdx when dragging', () => {
			const s = signal({ dragIdx: 0, overIdx: 1 });
			const t = {
				args: {
					...args,
					drag: s
				}
			};

			const { container } = render(<Grid {...t.args} />);
			const rows = container.getElementsByTagName('tbody')[0].getElementsByTagName('tr');

			fireEvent.dragOver(rows[1]);

			expect(s.value).toEqual({ dragIdx: 0, overIdx: 1 });
		});

		it('should move row forward in list, call onReorder, and reset drag on drop', () => {
			const drag = signal(undefined);
			const onReorder = vi.fn();
			const t = {
				args: {
					...args,
					drag
				}
			};

			const { container } = render(<Grid {...t.args} onReorder={onReorder} />);
			const rows = container.getElementsByTagName('tbody')[0].getElementsByTagName('tr');

			fireEvent.dragStart(rows[0]);
			fireEvent.dragOver(rows[1]);

			expect(drag.value).toEqual({ dragIdx: 0, overIdx: 1 });

			fireEvent.drop(rows[1]);

			expect(onReorder).toHaveBeenCalledOnce();
			expect(onReorder).toHaveBeenCalledWith([expect.objectContaining({ id: 4 }), expect.objectContaining({ id: 3 })]);

			expect(drag.value).toEqual(undefined);
		});

		it('should move row to the top of the list, call onReorder, and reset drag on drop', () => {
			const drag = signal(undefined);
			const onReorder = vi.fn();
			const t = {
				args: {
					...args,
					drag
				}
			};

			const { container } = render(<Grid {...t.args} onReorder={onReorder} />);
			const rows = container.getElementsByTagName('tbody')[0].getElementsByTagName('tr');

			fireEvent.dragStart(rows[1]);
			fireEvent.dragOver(rows[0]);

			expect(drag.value).toEqual({ dragIdx: 1, overIdx: 0 });

			fireEvent.drop(rows[0]);

			expect(onReorder).toHaveBeenCalledOnce();
			expect(onReorder).toHaveBeenCalledWith([expect.objectContaining({ id: 4 }), expect.objectContaining({ id: 3 })]);

			expect(drag.value).toEqual(undefined);
		});
	});
});
