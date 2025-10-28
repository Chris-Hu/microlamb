import {Logger} from './utils.js';

export class LambdaEvent {
    #headers = new Map();
    #raw = {}

    constructor(data) {
        this.#raw = data;
        this.#buildHeaders(Object.hasOwn(data, 'headers') ? data.headers : data);
    }

    #buildHeaders(headers) {
        try {
            let ks = Object.keys(headers);
            ks.forEach((k) => {
                let v = headers[k];
                this.#headers.set(k, v);
            })
        } catch (e) {
            Logger.error(`Not Valid Headers ...: ${headers}`)
            throw new Error(e.message);
        }
    }

    headers() {
        return this.#headers;
    }

    getHeader(k) {
        return this.#headers.get(k);
    }

    getRaw() {
        return this.#raw;
    }

    getMethod() {
        let method = 'http' in this.#raw.requestContext
            ? this.#raw.requestContext.http.method
            : this.#raw.requestContext.httpMethod;

        return (new String(method)).toUpperCase();
    }

    getPath() {
        let path = 'http' in this.#raw.requestContext
            ? this.#raw.requestContext.http.path
            : this.#raw.requestContext.path;

        return path;
    }

    getBody() {
       return 'body' in this.#raw ? this.#raw.body : '{}';
    }

    hasHeader(k) {
        return this.#headers.has(k);
    }

    headerAuthAllowed(token) {
        let k = this.hasHeader('authorization') ? 'authorization'
            : this.hasHeader('Authorization') ? 'Authorization'
                : undefined;
        if (k) {
            let split = this.getHeader(k).split(' ');
            return split.length === 2 && split[1] === token;
        }
        return false;
    }

    /**
     * search in Headers with regex value
     * @param headerCheck header to search for
     * @returns {Map<any, any>}
     */
    headerSearch(headerCheck) {
        let found = new Map();
        headerCheck = Array.isArray(headerCheck) ? headerCheck : [headerCheck];
        headerCheck.forEach((h) => {
            let hKey = Object.getOwnPropertyNames(h)[0];
            if (this.hasHeader(hKey)) {
                let reg = new RegExp(h[hKey]);
                let rExt = reg.exec(this.getHeader(hKey));
                if (rExt !== null && Object.hasOwn(rExt.groups, 'value')) {
                    found.set(hKey, rExt.groups.value);
                }
            }
        })
        return found;
    }
}
