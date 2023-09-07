import { Signal } from '@preact/signals';
import { FunctionalComponent } from 'preact';
import { useRef } from 'preact/hooks';
import styles from './grid.module.scss';

export type Drag = {
	dragIdx: number;
	overIdx: number;
	ypos: number;
};

export interface Args<Row> {
	rows: Row[];
	drag?: Signal<Drag | undefined>;
	RowView?: FunctionalComponent<{ row: Row; rowIdx: number }>;
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
	RowView = ({ row }) => <div class={styles.row}>{typeof row === 'string' ? row : JSON.stringify(row)}</div>
}: Args<R> & EventHandlers) => {
	const gridWrap = useRef<HTMLDivElement>(null);

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
							class={`${i === drag?.value?.overIdx ? styles.dragOver : ''}`}
							draggable={drag?.value?.dragIdx === i || drag?.value?.dragIdx === undefined}
							onDragOver={(e) => {
								console.log('over', drag?.value?.overIdx, i);

								if (drag?.value && gridWrap.current) {
									e.preventDefault();

									drag.value = {
										...drag.value,
										overIdx: i,
										ypos: ypos(e.pageY, gridWrap.current.getBoundingClientRect())
									};
								}
							}}
							onDragStart={(e) => {
								console.log('start');

								if (drag && (e.target as HTMLElement).draggable && gridWrap.current) {
									drag.value = {
										dragIdx: i,
										overIdx: i,
										ypos: ypos(e.pageY, gridWrap.current.getBoundingClientRect())
									};
									console.log('start', drag.value);

									// e.dataTransfer?.setData('application/json', JSON.stringify(row));
									const img = new Image();
									img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==';
									e.dataTransfer?.setDragImage(img, 1, 1);

									if (e.dataTransfer?.effectAllowed) {
										e.dataTransfer.effectAllowed = 'move';
									}
								} else {
									e.preventDefault();
								}
							}}
							onDragEnd={(e) => {
								console.log('end', drag?.value);
								e.preventDefault();

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
						>
							<td>
								<RowView row={row} rowIdx={i} />
							</td>
						</tr>
					))}
				</tbody>
			</table>
			{drag?.value && (
				<div class={styles.dragItem} style={{ left: 0, top: drag.value?.ypos }}>
					<span>hover thing</span>
					<RowView row={rows[drag.value.dragIdx]} rowIdx={0} />
				</div>
			)}
		</div>
	);
};

const ypos = (mouseY: number, rect?: DOMRect): number => {
	if (!rect) {
		return 0;
	}

	const y = mouseY - rect.top;

	return y > rect.height ? rect.height : y;
};
