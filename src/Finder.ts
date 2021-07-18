import { Crtsh, DataResult, Callback as callback, Parser } from "./interfaces";

import dns from "dns";
import axios from "axios";
// @ts-ignore
import cf from "cloudflare-detect";

/**
 * app class
 */
class Finder {
	/**
	 * private method to collect subdomains
	 * 
	 * @param domain to be lookedup
	 * @returns json from crt.sh
	 */
	private async crtsh(domain: string): Promise<Crtsh> {
		try {
			let response = await axios({
				method: "GET",
				url: "https://crt.sh/",
				params: {
					q: `%.${domain}`,
					output: "json"
				}
			});

			let result: Crtsh = {
				status: {
					code: response.status,
					text: response.statusText
				},
				body: response.data
			};

			return result;
		} catch (error) {
			let result: Crtsh = {
				status: {
					code: 500,
					text: "Oops! an error has occurred"
				},
				body: []
			};

			return result;
		}
	}

	/**
	 * private method to ping domain and check status code
	 * 
	 * @param domain to check
	 * @returns status code of request
	 */
	private async status(domain: string): Promise<number> {
		try {
			let response = await axios({
				url: "http://" + domain
			});

			return response.status;
		} catch (error: any) {
			if (error.response) {
				return error.response.status;
			} else {
				return 404;
			}
		}
	}

	/**
	 * private method to get ip address from domain
	 * 
	 * @param domain to be searched for ip address
	 * @returns array of obtained ip addresses
	 */
	private async ips(domain: string): Promise<string[]> {
		return new Promise(function (resolve, reject) {
			dns.resolve4(domain, function (error, addresses) {
				if (error) return resolve([]);

				resolve(addresses);
			});
		});
	}

	/**
	 * private method to get list of domains & subdomains
	 * and clean up duplicate domains & subdomains
	 * 
	 * @param domain to be parsed
	 * @returns clean array containing domain names
	 */
	private async parser(domain: string): Promise<Parser> {
		const self = this;
		let data = [];

		/**
		 * function to parse subdomains by domain name
		 * 
		 * @param body contains dirty array
		 * @returns cleared array
		 */
		const parser = (body: Array<object>): Array<string> => {
			let result = body.map(function (value: any) {
				return value.name_value.split("\n");
			});

			return result;
		};

		/**
		 * function to remove duplicate domain/subdomain names
		 * 
		 * @param body contains dirty array
		 * @returns cleared array
		 */
		const unique = (body: Array<string>): Array<string> => {
			let result = body.filter(function (value, index, array) {
				return array.indexOf(value) === index && !(new RegExp(/^\*/).test(value));
			});

			return result;
		};

		const { status, body } = await self.crtsh(domain);
		if (status.code !== 200) {
			let result: Parser = {
				data: [],
				error: status.text
			};

			return result;
		}

		// if domain list is not available
		if (body.length < 1) {
			let result: Parser = {
				data: [],
				error: null
			};
			return result;
		}

		// parse domain name
		let parsed = parser(body).flat();
		// remove duplicate domains
		parsed = unique(parsed);
		// sort by subdomain name
		parsed.sort(function (a, b) {
			let domainA = a.toUpperCase();
			let domainB = b.toUpperCase();

			return (domainA < domainB) ? -1 : (domainA > domainB) ? 1 : 0;
		});

		// loops the existing clean data
		// and creates an array with appropriate interface
		for (let index in parsed) {
			let subdomain = parsed[index];
			let status = await self.status(subdomain);
			let ips = await self.ips(subdomain);
			let cloudflare = await cf(subdomain);

			let result: DataResult = {
				subdomain,
				status,
				ips,
				cloudflare
			};

			data.push(result);
		}

		let result: Parser = {
			data,
			error: null
		};
		return result;
	}

	/**
	 * method to lookup subdomains and their status by domain
	 * 
	 * @param domain to be lookedup
	 * @param callback function to be executed
	 * 
	 * @returns promise if callback is not initialized
	 */
	public async lookup(domain: string, callback?: callback): Promise<any> {
		const self = this;

		// this part will be executed
		// if callback is initiated
		if (callback && typeof callback === "function") {
			try {
				let results = await self.parser(domain);

				callback(results.data, results.error);
			} catch (error) {
				callback([], error);
			}

			return;
		}

		// if not callback then return promise
		return new Promise(async function (resolve, reject) {
			try {
				let results = await self.parser(domain);

				resolve(results.data);
			} catch (error) {
				reject(error);
			}
		});
	}
}

export default Finder;
