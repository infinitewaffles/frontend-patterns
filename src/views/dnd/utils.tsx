import { Signal, useSignal } from '@preact/signals';
import { JSXInternal } from 'preact/src/jsx';
import { State as HandleState, SpatulaType } from './handle';

export interface OverlayPositionArgs {
	wrapperRect: Pick<DOMRect, 'top'>;
	destRect: Pick<DOMRect, 'top'>;
}

export const overlayPosition = ({ wrapperRect, destRect }: OverlayPositionArgs): JSXInternal.CSSProperties => {
	const top = destRect.top - wrapperRect.top;
	return { left: 0, top: top >= 0 ? top : 0 };
};

export interface SpatulaPositionArgs {
	targetRect: Pick<DOMRect, 'top' | 'left' | 'height'>;
	spatulaRect: Pick<DOMRect, 'width' | 'height'>;
}

export const spatulaPosition = ({ targetRect, spatulaRect }: SpatulaPositionArgs): JSXInternal.CSSProperties => {
	const center = targetRect.top + targetRect.height / 2;
	const top = center - spatulaRect.height / 2;
	const left = targetRect.left - spatulaRect.width / 2;

	return { left, top };
};

interface HandleStuff {
	state: Signal<HandleState>;
	idx: number;
}

export const useHandle = () => {
	const s = useSignal(SpatulaType.Hidden);
	const stuff = useSignal<HandleStuff>({
		state: s,
		idx: -1
	});

	return stuff;
};
