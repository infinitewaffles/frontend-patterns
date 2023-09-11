import { useSignal } from '@preact/signals';
import { FunctionalComponent } from 'preact';
import { RouteHandler } from '../../router';
import { DndRoute, RoutePath } from '../../router-utils';
import * as Grid from '../../views/dnd/grid';
import { adventureTimeCharacters } from './data';
import styles from './index.module.scss';

export interface State {
	route: DndRoute;
}

export const init = (r?: DndRoute) => ({
	route: r || { path: RoutePath.Dnd }
});

type TestRow = Grid.Keyed & {
	name: string;
};

const rowData = adventureTimeCharacters.map((name) => ({
	key: () => name,
	name
}));

const MenuView: FunctionalComponent<any> = ({ targetRect }) => {
	return (
		<div class={styles.menu} style={{ top: targetRect.top + 12, left: targetRect.left + 12 }}>
			<ul>
				{Array.from({ length: 5 }, (_, i) => (
					<li>thing {i}</li>
				))}
			</ul>
		</div>
	);
};

export const View: FunctionalComponent<State> = ({ route }) => {
	const rows = useSignal<TestRow[]>(rowData);
	const drag = useSignal<Grid.Drag<TestRow>>({
		__style: Grid.DragStyle.Html,
		ItemView: ({ row }) => <div class={styles.row}>{row.name}</div>
	});

	return (
		<div class={styles.page}>
			<Grid.View<TestRow>
				rows={rows.value}
				MenuView={MenuView}
				RowView={({ row }) => <div class={styles.row}>{row.name}</div>}
				drag={drag}
				onReorder={({ sourceIdx, destIdx }) => {
					const r = rows.value.slice();
					r.splice(destIdx, 0, r.splice(sourceIdx, 1)[0]);
					rows.value = r;
				}}
			/>
		</div>
	);
};

export default {
	path: RoutePath.Dnd,
	init,
	View,
	title: 'Drag & Drop Component'
} as RouteHandler<DndRoute, State>;
