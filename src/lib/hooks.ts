import { useSignal } from '@preact/signals';
import { useCallback, useState } from 'preact/hooks';
import { AppRoute } from '../router-utils';
import { User, getGlobalState } from './state';

// many of these inspired by https://gist.github.com/developit/a72311c247756f24da5b22d19c9dad48

/**
 * useSignal, but re-rendering with a different value arg updates the signal.
 * Useful for: const a = useLiveSignal(props.a)
 */
export const useLiveSignal = <T>(value: T) => {
	const s = useSignal(value);
	if (s.peek() !== value) s.value = value;
	return s;
};

export interface SharedState {
	currentRoute: Readonly<AppRoute>;
	user: Readonly<User>;
}

/**
 * Binds global state to a re-rendering function. Uses readonly to prevent callers from mutating things they do not own.
 */
export const useGlobalState = (): SharedState => {
	const s = getGlobalState();
	const user = useLiveSignal(s.user.value);
	const currentRoute = useLiveSignal(s.currentRoute.value);

	return { user: user.value, currentRoute: currentRoute.value };
};

/**
 * refs and effects don't play nice together. useCallback fixes this.
 * https://legacy.reactjs.org/docs/hooks-faq.html?source=post_page-----eb7c15198780--------------------------------#how-can-i-measure-a-dom-node
 */
export const useBoundingRect = <E extends HTMLElement>(): [DOMRect | undefined, (node: E | null) => void] => {
	const [rect, setRect] = useState<DOMRect>();
	const ref = useCallback((node: E | null) => {
		if (node !== null) {
			setRect((node as E).getBoundingClientRect());
		}
	}, []);

	return [rect, ref];
};
