import { useSignal } from '@preact/signals';
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
