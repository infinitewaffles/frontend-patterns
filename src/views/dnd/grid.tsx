import { Signal, batch, useSignal } from '@preact/signals';
import { FunctionalComponent } from 'preact';
import { useEffect, useRef } from 'preact/hooks';
import { classIf } from '../../lib/dom-helpers';
import styles from './grid.module.scss';
import * as Handle from './handle';
import { useHandle } from './handle';
import * as Overlay from './overlay';
import { useHandleIndex } from './utils';

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

export const View = <R extends Keyed>({ drag, onReorder, rows, RowView }: Args<R> & EventHandlers) => {
	const gridWrapRef = useRef<HTMLDivElement>(null);
	const handleTargetRef = useRef<HTMLTableRowElement>(null);
	const handleIdx = useHandleIndex();
	const handle = useHandle();
	const targetRect = useSignal<Pick<DOMRect, 'top' | 'height' | 'left'>>({ top: 0, height: 0, left: 0 });

	useEffect(() => {
		if (handleTargetRef.current) {
			targetRect.value = handleTargetRef.current.getBoundingClientRect();
		}
	}, [handleTargetRef.current?.getBoundingClientRect()]);

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

						return (
							<tr
								key={row.key()}
								ref={handleIdx.value === i ? handleTargetRef : undefined}
								// This logic needs to consider the mouse position within the item.
								class={classIf([
									[styles.dragOver, i === dragState?.dragging?.destIdx],
									[styles.dragSource, i === dragState?.dragging?.sourceIdx]
								])}
								onMouseEnter={
									!dragState?.dragging && handleIdx.value !== i
										? () =>
												batch(() => {
													handleIdx.value = i;
													handle.value = Handle.SpatulaType.Hovering;
												})
										: undefined
								}
								onDragOver={(e) => {
									e.preventDefault();

									batch(() => {
										handleIdx.value = i;

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
				state={handle}
				targetRect={targetRect.value}
				onDragStart={() => {
					if (drag.value.__style === DragStyle.Html && handleIdx.value !== undefined) {
						drag.value = {
							...drag.value,
							dragging: {
								sourceIdx: handleIdx.value,
								destIdx: handleIdx.value
							}
						};
					}
				}}
				onDragEnd={() =>
					batch(() => {
						if (drag.value.__style === DragStyle.Html) {
							if (onReorder && drag.value.dragging && drag.value.dragging.sourceIdx !== drag.value.dragging.destIdx) {
								onReorder(drag.value.dragging);
							}

							drag.value = { ...drag.value, dragging: undefined };
						}
					})
				}
			>
				<div style={{ position: 'fixed', top: 100, left: 10 }}>TODO: replace this placeholder with a real menu</div>
			</Handle.View>

			{drag.value.__style === DragStyle.Html && drag.value.dragging ? (
				<Overlay.View<R>
					{...drag.value}
					wrapperRect={gridWrapRef.current?.getBoundingClientRect() || { top: 0 }}
					destRect={handleTargetRef.current?.getBoundingClientRect() || { top: 0 }}
					row={rows[drag.value.dragging.sourceIdx]}
				/>
			) : null}
		</div>
	);
};
