import {isObject, Logger} from './utils.js';
import {TYPES} from './http-consts.js';
import https from 'node:https';
import http from 'node:http';
import fs from 'node:fs';
import {Buffer} from 'node:buffer';

export class HttpRequest {
    options = {}
    DEFAULT_TIMEOUT = 10000;

    constructor(certOptions = {}, useCert = false, useKeyFile = false, secureProtocol = 'TLSv1_2_method') {
        if (useCert) {
            let key = useKeyFile ? fs.readFileSync(certOptions.key) : certOptions.key;
            let cert = fs.readFileSync(certOptions.cert);
            this.options.secureProtocol = secureProtocol;
            this.options.key = key;
            this.options.cert = cert;
        }
    }

    requestEnd(req, reject, data, timeout) {
        req.on('socket', (socket) => {
            socket.on('secureConnect', () => {
                if (socket.authorized === false)
                    Logger.log(`SOCKET AUTH FAILED ${socket.authorizationError}`);
                else Logger.log("TLS Connection established successfully!");
            });
            // @TODO Handle timeout Got Error msecs argument must be of type number
            socket.setTimeout(isNaN(timeout) ? this.DEFAULT_TIMEOUT : timeout );
            socket.on('timeout', () => {
                reject({statusCode: null, err: Error('TLS Socket Timeout')});
            });
        });
        req.on('error', (err) => {
            reject({statusCode: null, err: err});
        });

        if (data !== null) {
            req.write(data);
        }

        req.end();
    }

    /**
     * Every simple requests handled here
     * @param options
     * @param data String
     * @param acceptCode
     * @param timeout ms
     * @returns {Promise<*>}
     */
    async request(options, data = null, acceptCode = [], timeout = this.DEFAULT_TIMEOUT) {
        if ('secureProtocol' in this.options && 'key' in this.options && 'cert' in this.options) {
            options.secureProtocol = this.options.secureProtocol;
            options.key = this.options.key;
            options.cert = this.options.cert;
            options.agent = new https.Agent(options);
        }

        return new Promise((resolve, reject) => {
            let dataBuf = [];
            const req = https.request(options, (resp) => {
                Logger.debug(' resp rawHeaders-----------------------');
                Logger.debug(JSON.stringify(resp.rawHeaders));
                Logger.debug('----------------------- resp rawHeaders');

                if (Math.round(resp.statusCode / 100 ) !== 2 && !acceptCode.includes(resp.statusCode)) {
                    Logger.log(` status code NOT HTTP_OK => ${resp.statusCode}`);
                    req.end();
                    reject({
                        statusCode: resp.statusCode,
                        errData: resp,
                        err: Error(`Status code not HTTP_OK -> ${resp.statusCode}`)
                    });
                }

                resp.on('data', (data) => {
                    dataBuf.push(data);
                });


                resp.on('close', () => {
                    let data = Buffer.concat(dataBuf);
                    resolve(data);
                });
            });

            req.setTimeout(timeout);

            this.requestEnd(req, reject, data, timeout);
        });
    }

}
