export type MaybeClass = [string] | [string, boolean] | [string, undefined] | [string, null];

export const classIf = (items: MaybeClass[]): string =>
	items.reduce((acc, [className, shouldInclude = true]) => {
		if (shouldInclude === true && className.length > 0) {
			if (acc.length > 0) {
				return `${acc} ${className}`;
			} else {
				return className;
			}
		}

		return acc;
	}, '');
