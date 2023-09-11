import { Signal, batch } from '@preact/signals';
import { FunctionalComponent } from 'preact';
import { classIf } from '../../lib/dom-helpers';
import { useBoundingRect } from '../../lib/hooks';
import styles from './grid.module.scss';
import * as Handle from './handle';
import * as Overlay from './overlay';
import { useHandle } from './utils';

export enum DragStyle {
	None,
	Html
}

export interface Keyed {
	key: () => string;
}

export type Drag<R> =
	| { __style: DragStyle.None }
	| {
			__style: DragStyle.Html;
			ItemView: FunctionalComponent<{ row: R }>;
			dragging?: ReorderArgs;
	  };

export interface Args<R> {
	rows: R[];
	drag: Signal<Drag<R>>;
	MenuView?: FunctionalComponent<{ row: R; rowIdx: number; targetRect: Pick<DOMRect, 'top' | 'height' | 'left'> }>;
	RowView: FunctionalComponent<{
		row: R;
		rowIdx: number;
	}>;
}

interface ReorderArgs {
	sourceIdx: number;
	destIdx: number;
}

interface EventHandlers {
	onReorder?: (args: ReorderArgs) => void;
}

export const View = <R extends Keyed>({ drag, onReorder, rows, RowView, MenuView }: Args<R> & EventHandlers) => {
	const [gridRect, gridWrapRef] = useBoundingRect<HTMLDivElement>();
	const [targetRect, targetRowRef] = useBoundingRect();
	// const handleTargetRef = useRef<HTMLTableRowElement>(null);
	const handle = useHandle();

	return (
		<div ref={gridWrapRef} class={styles.grid}>
			<table>
				<thead>
					<tr>
						<th>Table Header</th>
					</tr>
				</thead>
				<tbody>
					{rows.map((row, i) => {
						const dragState = drag.value.__style === DragStyle.Html ? drag.value : undefined;
						const handleState = handle.value.state.value;

						return (
							<tr
								key={row.key()}
								ref={handle.value.idx === i ? targetRowRef : undefined}
								// This logic needs to consider the mouse position within the item.
								class={classIf([
									[styles.dragOver, i === dragState?.dragging?.destIdx],
									[styles.dragSource, i === dragState?.dragging?.sourceIdx]
								])}
								onMouseEnter={
									(handleState === Handle.SpatulaType.Hidden || handleState === Handle.SpatulaType.Hovering) &&
									handle.value.idx !== i
										? () =>
												batch(() => {
													handle.value = { ...handle.value, idx: i };
													handle.value.state.value = Handle.SpatulaType.Hovering;
												})
										: undefined
								}
								onDragOver={(e) => {
									e.preventDefault();

									batch(() => {
										handle.value = {
											...handle.value,
											idx: i
										};

										if (drag.value.__style === DragStyle.Html && drag.value.dragging) {
											drag.value = {
												...drag.value,
												dragging: {
													...drag.value.dragging,
													destIdx: i
												}
											};
										}
									});
								}}
							>
								<td>
									<RowView row={row} rowIdx={i} />
								</td>
							</tr>
						);
					})}
				</tbody>
			</table>

			<Handle.View
				state={handle.value.state}
				targetRect={targetRect || { top: -100, height: 0, left: -100 - 100 }}
				onDragStart={() => {
					if (drag.value.__style === DragStyle.Html && handle.value.idx !== undefined) {
						drag.value = {
							...drag.value,
							dragging: {
								sourceIdx: handle.value.idx,
								destIdx: handle.value.idx
							}
						};
					}
				}}
				onDragEnd={() =>
					batch(() => {
						if (drag.value.__style === DragStyle.Html) {
							if (onReorder && drag.value.dragging) {
								const args = drag.value.dragging;

								if (args.destIdx <= 0) {
									onReorder({ ...args, destIdx: 0 });
								} else if (args.destIdx < args.sourceIdx) {
									onReorder(args);
								} else if (args.destIdx - args.sourceIdx > 1) {
									onReorder({ ...args, destIdx: args.destIdx - 1 });
								}
							}

							drag.value = { ...drag.value, dragging: undefined };
						}
					})
				}
			>
				{MenuView && handle.value.idx >= 0 ? (
					<MenuView
						row={rows[handle.value.idx]}
						rowIdx={handle.value.idx}
						targetRect={targetRect || { top: -100, height: 0, left: -100 - 100 }}
					/>
				) : null}
			</Handle.View>

			{drag.value.__style === DragStyle.Html && drag.value.dragging ? (
				<Overlay.View<R>
					{...drag.value}
					wrapperRect={gridRect}
					destRect={targetRect || { top: 0 }}
					row={rows[drag.value.dragging.sourceIdx]}
				/>
			) : null}
		</div>
	);
};
