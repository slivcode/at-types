import got = require('got');
import { NpmsItem, NpmsSearchResult } from '../../typings/npms-items';
export type T_fetchTypesListFromNpmsIoApi = (page: number) => Promise<NpmsSearchResult>;
export const fetchTypesListFromNpmsIoApi: T_fetchTypesListFromNpmsIoApi = async (page: number = 1) => {
	let size = 250;
	let { body }: { body: NpmsSearchResult } = await got('https://api.npms.io/v2/search', {
		query: {
			q: 'scope:types',
			from: page * size,
			size: size,
		},
		json: true,
	}) as any;
	return body as NpmsSearchResult;
};
export let atTypesLength = '@types/'.length;
export let getNamesFromItem = (i: NpmsItem) => i.package.name.slice(atTypesLength) as string;
