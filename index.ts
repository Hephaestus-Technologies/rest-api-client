import * as qs from "querystring";
import * as https from "https";
import {RequestOptions} from "https";
import {OutgoingHttpHeaders} from "http";

export interface BasicCredentials {
    username: string,
    password: string
}

export type TokenCredentials = string;

export type Credentials = BasicCredentials | TokenCredentials | null;

interface RequestConfig {

    method: "GET" | "POST" | "PUT" |  "DELETE";

    url: string;

    data?: any;

    credentials?: Credentials;

    headers?: OutgoingHttpHeaders | null

}

// noinspection JSUnusedGlobalSymbols
export default class RestApiClient {

    public constructor(
        private hostname: string,
        private urlPrefix = ""
    ) { }

    public get<T>(url: string, data: {} = null, credentials: Credentials = null): Promise<T> {
        return this._sendRequest({
            method: "GET",
            url: url + (data ? `?${qs.stringify(data)}` : ""),
            credentials
        });
    }

    public post<T>(url: string, data: {}, credentials: Credentials = null): Promise<T> {
        return this._sendRequest({
            method: "POST",
            url,
            data,
            credentials
        });
    }

    public put<T>(url: string, data: {}, credentials: Credentials = null): Promise<T> {
        return this._sendRequest({
            method: "PUT",
            url,
            data,
            credentials
        });
    }

    public delete<T>(url: string, data: {} = null, credentials: Credentials = null): Promise<T> {
        return this._sendRequest({
            method: "DELETE",
            url: url + (data ? `?${qs.stringify(data)}` : ""),
            credentials
        });
    }

    public postForm<T>(url: string, data: {}, credentials: Credentials = null): Promise<T> {
        return this._sendRequest({
            method: "POST",
            url,
            data: qs.stringify(data),
            credentials,
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            }
        });
    }

    private _sendRequest<T>(config: RequestConfig): Promise<T> {
        return new Promise((resolve, reject) => {
            let result = "";
            const req = https.request(this._fullOptionsOf(config), (res) => {
                res.on("data", (buf) => result += buf.toString());
                res.on("end", () => resolve(JSON.parse(result)));
            });
            req.on("error", reject);
            req.on("close", () => req.abort());
            if (config.data) req.write(config.data);
            req.end();
        });
    }

    private _fullOptionsOf(config: any): RequestOptions {
        return {
            ...config,
            hostname: this.hostname,
            path: RestApiClient._trim(`${this.urlPrefix}/${config.url}`),
            method: config.method,
            headers: {
                "Content-Type": "application/json",
                ...config.headers,
                ...RestApiClient.authOf(config.credentials)
            }
        };
    }

    private static _trim(url: string): string {
        return url.split("/").filter(Boolean).join("/");
    }

    private static authOf(credentials: BasicCredentials = null): {} {
        if (!credentials) return {};
        if (RestApiClient._isBasic(credentials))
            return {Authorization: RestApiClient._basicAuthOf(credentials)};
        return {Authorization: `Bearer ${credentials}`};
    }

    private static _isBasic(credentials: Credentials): credentials is BasicCredentials {
        const basicCreds = credentials as BasicCredentials;
        return Boolean(basicCreds.username) && Boolean(basicCreds.password);
    }


    private static _basicAuthOf(credentials: BasicCredentials): {} {
        const str = `${credentials.username}:${credentials.password}`;
        return "Basic " + Buffer.from(str).toString("base64");
    }

}
