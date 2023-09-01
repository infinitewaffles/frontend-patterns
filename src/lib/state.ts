import { Signal, signal } from '@preact/signals';
import { AppRoute, RoutePath } from '../router-utils';

export enum UserType {
	Anonymous,
	Authenticated
}

export type User =
	| { userType: UserType.Anonymous }
	| {
			userType: UserType.Authenticated;
			name: string;
	  };

export interface GlobalState {
	currentRoute: Signal<AppRoute>;
	user: Signal<User>;
}

let globalState: GlobalState | undefined = undefined;

export const getGlobalState = (): GlobalState => {
	if (globalState) {
		return globalState;
	}

	const user = signal<User>({ userType: UserType.Anonymous });
	const currentRoute = signal<AppRoute>({ path: RoutePath.Home });
	globalState = { user, currentRoute };

	// Here is a good place to put observers that would need to perform a pull for fresh data.
	// e.g. user.subscribe(() => loadUserData())

	return globalState;
};
