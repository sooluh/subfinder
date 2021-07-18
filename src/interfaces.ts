export interface Crtsh {
	status: {
		code: number,
		text: string
	},
	body: any
}

export interface DataResult {
	subdomain: string,
	status: number,
	ips: string,
	cloudflare: boolean
}

export type Callback = (
	data: null | Array<DataResult>,
	error?: null | any
) => void;
