import {jsonOBJ, Logger} from '../common/utils.js';

export class Router {
    #route = new Map();

    constructor(file) {
        let loaded = jsonOBJ.loadFromFile(file);
        this.#buildRoutes(loaded);
    }

    #buildRoutes(data) {
        if (! Object.hasOwn(data,'routes') && !Array.isArray(data)) {
            throw new Error('Routes are not valid ...');
        }

        data.routes.forEach((elt) => {
            let k = Object.getOwnPropertyNames(elt)[0];
            this.#route.set(k, elt[k]);
        })
    }

    /**
     *
     * @param event LambdaEvent
     * @returns {*}
     */
    match(lambdaEvent) {
        //@TODO check if Cookie is always in event.headers

        let method = lambdaEvent.getMethod();
        let path = lambdaEvent.getPath();
        let raw = lambdaEvent.getRaw();

        let qs = Object.hasOwn(raw, 'rawQueryString') && raw.rawQueryString !== '' ? `?${raw.rawQueryString}` : '';
        let reqIdentity = `${method}:${path}${qs}`;

        let ret = null;
        let filterHeaders = new Map();
        this.#route.forEach((obj, routeID, _) => {
            let idReg = new RegExp(`${obj.method}:${obj.reg}`);
            let identityMatch = reqIdentity.match(idReg);
            let headersMatch = true;
            if (Object.hasOwn(obj, 'headers')) {
                filterHeaders = lambdaEvent.headerSearch(obj.headers);
                headersMatch = filterHeaders.size > 0;
            }

            if (identityMatch !== null && headersMatch) {
                ret = {
                    id: routeID,
                    path: path,
                    identity: reqIdentity,
                    params: idReg.exec(reqIdentity).groups,
                    filterHeaders: filterHeaders
                }
            }
        })

        return ret;
    }
}
