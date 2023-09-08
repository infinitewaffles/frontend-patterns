import { Signal } from '@preact/signals';
import { FunctionalComponent } from 'preact';
import { useRef } from 'preact/hooks';
import { JSXInternal } from 'preact/src/jsx';
import { classIf } from '../../lib/dom-helpers';
import styles from './grid.module.scss';
import Spatula from './spatula';

export type Drag = {
	sourceIdx: number;
	destIdx: number;
	position: JSXInternal.CSSProperties;
};

export interface Args<Row> {
	rows: Row[];
	drag?: Signal<Drag | undefined>;
	RowView?: FunctionalComponent<{
		row: Row;
		rowIdx: number;
		onDragStart?: (e: JSXInternal.TargetedDragEvent<any>) => void;
		onDragEnd?: (e: JSXInternal.TargetedDragEvent<any>) => void;
	}>;
}

interface ReorderArgs {
	sourceIdx: number;
	destIdx: number;
}

interface EventHandlers {
	onReorder?: (args: ReorderArgs) => void;
}

export const View = <R,>({
	drag,
	onReorder,
	rows,
	RowView = ({ row, onDragStart, onDragEnd }) => (
		<div class={styles.row}>
			<div draggable={!!onDragStart} onDragStart={onDragStart} onDragEnd={onDragEnd}>
				<Spatula class={styles.spatula} />
			</div>
			{typeof row === 'string' ? row : JSON.stringify(row)}
		</div>
	)
}: Args<R> & EventHandlers) => {
	const gridWrap = useRef<HTMLDivElement>(null);
	const onDragStart = (idx: number) => (e: JSXInternal.TargetedDragEvent<any>) => {
		if (drag && (e.target as HTMLElement).draggable && gridWrap.current) {
			// e.dataTransfer?.setData('application/json', JSON.stringify(row));
			const img = new Image();
			img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==';
			e.dataTransfer?.setDragImage(img, 1, 1);

			if (e.dataTransfer?.effectAllowed) {
				e.dataTransfer.effectAllowed = 'move';
			}

			const next = {
				sourceIdx: idx,
				destIdx: idx,
				position: dragPosition(
					e.pageY,
					gridWrap.current.getBoundingClientRect(),
					(e.target as HTMLElement).getBoundingClientRect()
				)
			};

			setTimeout(() => {
				drag.value = next;
			}, 1);
		} else {
			e.preventDefault();
		}
	};

	console.log(drag?.value?.position);

	return (
		<div ref={gridWrap} class={styles.grid}>
			<table>
				<thead>
					<tr>
						<th>Table Header</th>
					</tr>
				</thead>
				<tbody>
					{rows.map((row, i) => {
						const dragState = drag?.value;

						return (
							<tr
								// This logic needs to consider the mouse position within the item.
								class={classIf([
									[styles.dragOver, i === dragState?.destIdx && !!dragState.position.top],
									[styles.dragOverLast, i === dragState?.destIdx && dragState.position.bottom !== undefined]
								])}
								onDragOver={(e) => {
									if (drag?.value && gridWrap.current) {
										e.preventDefault();

										console.log(
											e.pageY,
											gridWrap.current.getBoundingClientRect(),
											(e.target as HTMLElement).getBoundingClientRect()
										);

										drag.value = {
											...drag.value,
											destIdx: i,
											position: dragPosition(
												e.pageY,
												gridWrap.current.getBoundingClientRect(),
												(e.target as HTMLElement).getBoundingClientRect()
											)
										};
									}
								}}
							>
								<td>
									<RowView
										row={row}
										rowIdx={i}
										onDragStart={onDragStart(i)}
										onDragEnd={() => {
											if (onReorder && drag?.value && drag.value.sourceIdx !== drag.value.destIdx) {
												onReorder({
													sourceIdx: drag?.value?.sourceIdx,
													destIdx: drag?.value?.destIdx
												});
											}

											if (drag) {
												drag.value = undefined;
											}
										}}
									/>
								</td>
							</tr>
						);
					})}
				</tbody>
			</table>
			{drag?.value && (
				<div class={styles.dragItem} style={drag.value.position} onDragOver={(e) => e.preventDefault()}>
					<RowView row={rows[drag.value.sourceIdx]} rowIdx={0} />
				</div>
			)}
		</div>
	);
};

export const dragPosition = (
	mouseY: number,
	wrapperRect: Pick<DOMRect, 'top' | 'height'>,
	destRect: Pick<DOMRect, 'height'>
): JSXInternal.CSSProperties => {
	const lastPosition = wrapperRect.top + wrapperRect.height - destRect.height;

	if (mouseY >= lastPosition) {
		return { left: 0, bottom: 0 };
	}

	const halfHeight = destRect.height / 2;
	const itemTop = mouseY - wrapperRect.top - halfHeight;

	if (itemTop < 0) {
		return { left: 0, top: 0 };
	}

	return { left: 0, top: itemTop };
};
