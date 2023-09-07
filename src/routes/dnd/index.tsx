import { useSignal } from '@preact/signals';
import { FunctionalComponent } from 'preact';
import { RouteHandler } from '../../router';
import { DndRoute, RoutePath } from '../../router-utils';
import * as Grid from '../../views/dnd/grid';
import styles from './index.module.scss';

export interface State {
	route: DndRoute;
}

export const init = (r?: DndRoute) => ({
	route: r || { path: RoutePath.Dnd }
});

export const View: FunctionalComponent<State> = ({ route }) => {
	const drag = useSignal<Grid.Drag | undefined>(undefined);
	const rows = useSignal<string[]>(['jake the dog', 'finn the human', 'princess bubblegum', 'marceline']);

	return (
		<div class={styles.page}>
			<Grid.View
				rows={rows.value}
				drag={drag}
				onReorder={(r) => {
					alert(`item moved from position ${r.sourceIdx} to ${r.destIdx}`);
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