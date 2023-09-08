import { FunctionalComponent, RenderableProps } from 'preact';
import styles from './overlay.module.scss';
import { OverlayPositionArgs, overlayPosition } from './utils';

interface OverlayArgs<R> {
	row: R;
	ItemView: FunctionalComponent<{ row: R }>;
}

export const View = <R,>({
	row,
	ItemView,
	wrapperRect,
	destRect,
	children
}: OverlayArgs<R> & OverlayPositionArgs & RenderableProps<any>) => {
	return (
		<div class={styles.dragItem} style={overlayPosition({ wrapperRect, destRect })}>
			<ItemView row={row} />
			{children}
		</div>
	);
};
