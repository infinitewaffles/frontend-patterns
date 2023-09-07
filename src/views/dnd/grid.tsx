import { Signal } from '@preact/signals';
import { FunctionalComponent } from 'preact';
import { useRef } from 'preact/hooks';
import { JSXInternal } from 'preact/src/jsx';
import { classIf } from '../../lib/dom-helpers';
import styles from './grid.module.scss';
import Spatula from './spatula';

export type Drag = {
	dragIdx: number;
	overIdx: number;
	dragPosition: JSXInternal.CSSProperties;
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
				dragIdx: idx,
				overIdx: idx,
				dragPosition: dragPosition(
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

	return (
		<div ref={gridWrap} class={styles.grid}>
			<table>
				<thead>
					<tr>
						<th>Table Header</th>
					</tr>
				</thead>
				<tbody>
					{rows.map((row, i) => (
						<tr
							class={classIf([
								[styles.dragOverUp, i === drag?.value?.overIdx && i <= drag?.value?.dragIdx],
								[styles.dragOverDown, i === drag?.value?.overIdx && i > drag?.value?.dragIdx]
							])}
							onDragOver={(e) => {
								if (drag?.value && gridWrap.current) {
									e.preventDefault();

									drag.value = {
										...drag.value,
										overIdx: i,
										dragPosition: dragPosition(
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
										if (onReorder && drag?.value && drag.value.dragIdx !== drag.value.overIdx) {
											onReorder({
												sourceIdx: drag?.value?.dragIdx,
												destIdx: drag?.value?.overIdx
											});
										}

										if (drag) {
											drag.value = undefined;
										}
									}}
								/>
							</td>
						</tr>
					))}
				</tbody>
			</table>
			{drag?.value && (
				<div class={styles.dragItem} style={drag.value.dragPosition} onDragOver={(e) => e.preventDefault()}>
					<RowView row={rows[drag.value.dragIdx]} rowIdx={0} />
				</div>
			)}
		</div>
	);
};

const dragPosition = (mouseY: number, wrapperRect: DOMRect, dragOverRect: DOMRect): JSXInternal.CSSProperties => {
	const halfHeight = dragOverRect.height / 2;
	const itemTop = mouseY - wrapperRect.top - halfHeight;
	const itemBottom = itemTop + dragOverRect.height;

	if (itemTop < 0) {
		return { left: 0, top: 0 };
	} else if (itemBottom > wrapperRect.height) {
		return { left: 0, bottom: wrapperRect.height };
	}

	return { left: 0, top: itemTop };
};
