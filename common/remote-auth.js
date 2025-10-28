import {jsonOBJ, Logger} from './utils.js';
import {HttpRequest} from './http-request.js';
import {Buffer} from "node:buffer";

export class RemoteAuth extends HttpRequest {
    config;

    /**
     *
     * @param config AppConfig
     */
    constructor(config) {
        super();
        this.config = config;
    }

    delay(time) {
        return new Promise(resolve => setTimeout(resolve, time));
    }

    async doReq(options ,shouldBeParseable = true) {
        return new Promise((resolve, reject) => {
            this.request(options)
                .then((resp) => {
                    let data = Buffer.from(resp).toString();
                    if (shouldBeParseable && !jsonOBJ.isParseable(data)) {
                        reject(new Error(`NOT PARSEABLE resp from request AUTH -> ${data}`));
                    } else {
                        resolve(JSON.parse(data));
                    }
                }).catch((e) => {
                    reject(new Error(e.message));
                }
            )
        })
    }

    async withRetry(options, retry, delay) {
        for (let i = 0; i < retry; i++) {
            try {
                return await this.doReq(options);
            } catch (e) {
                await this.delay(delay);
                Logger.log(e, false);
            }
        }
        return Promise.reject(`REACHED MAX Retry ===> ${retry}`)
    }

    async acquire(secret, retry = 0, delay = 100) {
        let options = {}
        options.hostname = this.config.get('api.auth.host');
        options.port = this.config.get('api.auth.port');
        options.path = this.config.get('api.auth.path');
        options.method = this.config.get('api.auth.method');

        let headers = {};

        if (this.config.has('api.auth.header')) {
            headers = {...this.config.get('api.auth.header')}
        }

        options.headers = {...headers, ...{'Authorization': `Basic ${secret}`}}

        return retry === 0 ? this.doReq(options) : this.withRetry(options, retry, delay);
    }
}