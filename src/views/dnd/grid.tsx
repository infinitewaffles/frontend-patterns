import { Signal } from '@preact/signals';
import { FunctionalComponent } from 'preact';
import { useRef } from 'preact/hooks';
import { JSXInternal } from 'preact/src/jsx';
import { classIf } from '../../lib/dom-helpers';
import styles from './grid.module.scss';
import Spatula from './spatula';

interface DragPositionArgs {
	wrapperRect?: Pick<DOMRect, 'top'>;
	destRect: Pick<DOMRect, 'top'>;
}

export type Drag = {
	sourceIdx: number;
	destIdx: number;
	destRect: Pick<DOMRect, 'top'>;
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

// const mouseY = signal(0);

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
	const dragHoverRef = useRef<HTMLDivElement>(null);

	const onDragStart = (idx: number) => (e: JSXInternal.TargetedDragEvent<any>) => {
		if (drag && (e.target as HTMLElement).draggable) {
			// https://stackoverflow.com/questions/6481094/html5-drag-and-drop-ondragover-not-firing-in-chrome
			e.dataTransfer?.setData('text/plain', idx.toString()); //cannot be empty string

			const img = new Image();
			img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==';
			e.dataTransfer?.setDragImage(img, 1, 1);

			if (e.dataTransfer?.effectAllowed) {
				e.dataTransfer.effectAllowed = 'move';
			}

			const next = {
				sourceIdx: idx,
				destIdx: idx,
				destRect: (e.target as HTMLElement).getBoundingClientRect()
			};

			setTimeout(() => {
				drag.value = next;
			}, 1);
		} else {
			e.preventDefault();
		}
	};

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
						// console.log(pos, drag?.value?.destIdx);
						return (
							<tr
								// This logic needs to consider the mouse position within the item.
								class={classIf([[styles.dragOver, i === drag?.value?.destIdx]])}
								onDragOver={(e) => {
									console.log('drag over row', i);
									e.preventDefault();

									if (drag?.value && drag?.value?.destIdx !== i) {
										const d = drag?.value;

										drag.value = {
											...d,
											destIdx: i,
											destRect: (e.target as HTMLElement).getBoundingClientRect()
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
				<div
					ref={dragHoverRef}
					class={styles.dragItem}
					style={dragPosition({
						destRect: drag.value.destRect,
						wrapperRect: gridWrap.current?.getBoundingClientRect()
					})}
				>
					<RowView row={rows[drag.value.sourceIdx]} rowIdx={0} />
				</div>
			)}
		</div>
	);
};

export const dragPosition = ({ wrapperRect, destRect }: DragPositionArgs): JSXInternal.CSSProperties => {
	if (wrapperRect && destRect) {
		const top = destRect.top - wrapperRect.top;
		return { left: 0, top: top >= 0 ? top : 0 };
	}

	return {};
};
