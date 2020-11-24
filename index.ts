import * as qs from "querystring";
import * as https from "https";
import {RequestOptions} from "https";

export interface BasicCredentials {
    username: string,
    password: string
}

export type TokenCredentials = string;

export type Credentials = BasicCredentials | TokenCredentials | null;

// noinspection JSUnusedGlobalSymbols
export default class RestApiClient {

    private readonly _hostname: string;

    public constructor(hostname: string) {
        this._hostname = hostname;
    }

    public get<T>(url: string, data: {} = null, credentials: Credentials = null): Promise<T> {
        return this._sendRequest({
            method: "GET",
            url: url + data ? `?${qs.stringify(data)}` : "",
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
            url: url + data ? `?${qs.stringify(data)}` : "",
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

    private _sendRequest<T>(config: any): Promise<T> {
        return new Promise((resolve, reject) => {
            const req = https.request(this._fullOptionsOf(config), (res) => {
                res.on("data", (buf) => resolve(JSON.parse(buf.toString())));
            });
            req.on("error", reject);
            if (config.data) req.write(config.data);
            req.end();
        });
    }

    private _fullOptionsOf(config: any): RequestOptions {
        return {
            ...config,
            hostname: this._hostname,
            path: config.url,
            method: config.method,
            headers: {
                ...config.headers,
                ...RestApiClient.authOf(config.credentials)
            }
        };
    }

    private static authOf(credentials: BasicCredentials = null): {} {
        if (!credentials) return {};
        if (RestApiClient._isBasic(credentials))
            return {Authorization: RestApiClient._basicAuthOf(credentials)};
        return {Authorization: `Bearer ${credentials}`};
    }

    private static _isBasic(credentials: Credentials): credentials is BasicCredentials {
        const asBasic = credentials as BasicCredentials;
        return Boolean(asBasic.username) && Boolean(asBasic.password);
    }


    private static _basicAuthOf(credentials: BasicCredentials): {} {
        const str = `${credentials.username}:${credentials.password}`;
        return {Authorization: "Basic " + Buffer.from(str).toString("base64")};
    }

}
