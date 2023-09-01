import { FunctionalComponent } from 'preact';
import { Link } from 'preact-router';
import { useGlobalState } from '../../lib/hooks';
import { UserType } from '../../lib/state';
import { RoutePath, generateUrl } from '../../router-utils';
import styles from './header.module.scss';

interface EventHandlers {
	onSignIn: () => void;
	onSignOut: () => void;
}

export const Header: FunctionalComponent<EventHandlers> = ({ onSignIn, onSignOut }) => {
	const { user } = useGlobalState();

	return (
		<header class={styles.header}>
			<h1 class={styles.home}>
				<Link href={generateUrl({ path: RoutePath.Home })}>UI Patterns</Link>
			</h1>
			<div class={styles.user}>
				{user.userType === UserType.Anonymous ? (
					<button type="button" onClick={onSignIn}>
						Sign In
					</button>
				) : (
					<>
						<div>{user.name}</div>
						<button type="button" onClick={onSignOut}>
							Sign Out
						</button>
					</>
				)}
			</div>
		</header>
	);
};
