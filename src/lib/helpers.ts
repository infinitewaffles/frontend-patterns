// BONKERS (Also really cool!): https://www.petermorlion.com/iterating-a-typescript-enum/
export const enumKeys = <O extends object, K extends keyof O = keyof O>(obj: O): K[] => {
	return Object.keys(obj).filter((k) => Number.isNaN(+k)) as K[];
};
