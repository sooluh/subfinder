export interface Crtsh {
	status: {
		code: number,
		text: string
	},
	body: any
};

export interface DataResult {
	subdomain: string,
	status: number,
	ips: Array<string>,
	cloudflare: boolean
};

export interface Parser {
	data: Array<DataResult>,
	error?: any
};

export type Callback = (
	data: Array<DataResult>,
	error?: any
) => void;
