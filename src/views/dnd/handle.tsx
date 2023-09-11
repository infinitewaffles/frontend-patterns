import { Signal, useSignal } from '@preact/signals';
import { FunctionalComponent } from 'preact';
import { useEffect, useRef } from 'preact/hooks';
import { JSXInternal } from 'preact/src/jsx';
import { classIf } from '../../lib/dom-helpers';
import styles from './handle.module.scss';
import Spatula from './spatula';
import { spatulaPosition } from './utils';

export enum SpatulaType {
	Hidden,
	Hovering,
	Dragging,
	Menu
}

export interface Args {
	targetRect: Pick<DOMRect, 'top' | 'left' | 'height'>;
}

export type State = SpatulaType;

interface EventHandlers {
	onOpenMenu?: () => void;
	onCloseMenu?: () => void;
	onDragStart?: () => void;
	onDragEnd?: () => void;
}

const renderKey = '0990d2ac-970d-4d28-8653-5246ad94dcc1';

export const View: FunctionalComponent<{ state: Signal<State> } & Args & EventHandlers> = ({
	state,
	targetRect,
	children,
	onOpenMenu,
	onCloseMenu,
	onDragStart,
	onDragEnd
}) => {
	const spatulaRef = useRef<HTMLDivElement>(null);
	const pos = useSignal<JSXInternal.CSSProperties>({ width: 24, height: 24 });
	const spatulaType = state.value;

	useEffect(() => {
		if (spatulaRef.current) {
			pos.value = spatulaPosition({
				targetRect,
				spatulaRect: spatulaRef.current.getBoundingClientRect()
			});
		}
	}, [targetRect, spatulaRef.current]);

	switch (spatulaType) {
		case SpatulaType.Dragging:
			return (
				<div
					key={renderKey}
					ref={spatulaRef}
					draggable={true}
					class={classIf([[styles.handle], [styles.drag]])}
					style={pos.value}
					onDragEnd={() => {
						state.value = SpatulaType.Hovering;
						onDragEnd && onDragEnd();
					}}
				>
					<Spatula />
				</div>
			);
		case SpatulaType.Hovering:
			return (
				<div
					key={renderKey}
					ref={spatulaRef}
					draggable={true}
					class={classIf([[styles.handle], [styles.hover]])}
					style={pos.value}
					onClick={() => {
						state.value = SpatulaType.Menu;
						onOpenMenu && onOpenMenu();
					}}
					onDragStart={
						onDragStart &&
						((e) => {
							const img = new Image();
							img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==';
							e.dataTransfer?.setDragImage(img, 1, 1);

							if (e.dataTransfer) {
								e.dataTransfer.effectAllowed = 'move';
							}

							// The DOM cannot be mutated in the dragStart handler so this
							// state mutation needs to be run after this closure exits.
							setTimeout(() => {
								state.value = SpatulaType.Dragging;
								onDragStart();
							}, 1);
						})
					}
				>
					<Spatula />
				</div>
			);
		case SpatulaType.Menu:
			return (
				<div
					key={renderKey}
					ref={spatulaRef}
					draggable={false}
					class={classIf([[styles.handle], [styles.menu]])}
					style={pos.value}
					onClick={() => {
						state.value = SpatulaType.Hovering;
						onCloseMenu && onCloseMenu();
					}}
				>
					<Spatula />
					{children}
				</div>
			);
		default:
			return null;
	}
};
