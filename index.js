'use strict';

import {Config, Logger} from './common/utils.js';
import {HttpRequest} from './common/http-request.js';

import {HTTP_INTERNAL_SERVER_ERROR, HTTP_NOT_FOUND} from './common/http-consts.js';

import {Response} from './common/response.js';
import {Secret} from './aws/secret.js';
import {Renderer} from './modules/renderer.js';
import {Router} from './modules/router.js';
import {LambdaEvent} from './common/lambda-event.js';
import {ROUTE} from './services/route-consts.js';


const AppConfig = new Config('./config.json');

const tplVar = {
    USER: "{{USER}}",
    TIME: "{{TIME}}"
}

const getSecretKey = async (useLocal = false) => {
    if (useLocal) {
        return {
            token: `123A-${Date.now()}`,
            activeMAINTENANCE: AppConfig.get('app.maintenance.active')
        }
    }

    const secretName = AppConfig.get('app.s-name');
    const region = AppConfig.get('app.region');
    let secret = new Secret(secretName, region);
    return secret.get()
        .then((found) => {
            let ret = {
                token: null,
                activeMAINTENANCE: false
            }

            ret.token = found.token;
            ret.activeMAINTENANCE = Object.hasOwn(found, 'active_maintenance') ? found.active_maintenance : false;
            return ret;
        })
}

let templates = new Map(
    [
        [ROUTE.HELLO, AppConfig.config.app.tpl.hello],
        [ROUTE.BYE, AppConfig.config.app.tpl.bye]
    ]
);

let staticPages = new Map(
    [
        [ROUTE.MAINTENANCE, AppConfig.config.app.staticp.maintenance]
    ]
);

const renderer = new Renderer(templates);
const router = new Router('resource/route.json');

let client = new HttpRequest();

export const handler = async (event, context) => {
    if (event !== undefined) {
        let pSecrets = null;
        let lambdaEvent = new LambdaEvent(event);
        try {
            pSecrets = await getSecretKey(true);
        } catch (e) {
            Logger.error('INIT getSecretKey FAILED .....');
            Logger.log(e, false);
            return renderer.errorView(HTTP_INTERNAL_SERVER_ERROR);
        }
        let activeMaintenance = pSecrets.activeMAINTENANCE;
        if (activeMaintenance === true || activeMaintenance === 'true') {
            return renderer.loadStatic(staticPages.get(ROUTE.MAINTENANCE));
        }

        let request = router.match(lambdaEvent);
        if (request === null) {
            return renderer.errorView(HTTP_NOT_FOUND);
        }


        switch (request.id) {
            case ROUTE.MAINTENANCE:
                return renderer.loadStatic(staticPages.get(ROUTE.MAINTENANCE));
            case ROUTE.HELLO:
                try {
                    let reqUser = request.params.USER;

                    let tplValues = new Map();
                    tplValues.set(tplVar.USER, reqUser);

                    return renderer.view(ROUTE.HELLO, tplValues);
                } catch (err) {
                    Logger.error(err);
                    return renderer.errorView(HTTP_INTERNAL_SERVER_ERROR);
                }
            case ROUTE.BYE:
                try {
                    let tplValues = new Map();
                    tplValues.set(tplVar.TIME, new Date().toLocaleTimeString());

                    return renderer.view(ROUTE.BYE, tplValues);
                } catch (err) {
                    Logger.error(err);
                    return renderer.errorView(HTTP_INTERNAL_SERVER_ERROR);
                }
            case ROUTE.REGISTER:
                try {
                    let parsed = JSON.parse(lambdaEvent.getBody());
                    if (!Object.hasOwn(parsed, 'reference')) {
                        return Response.BadRequest();
                    }

                    return Response.OK({success:true ,
                        reference:parsed['reference'],
                        token: pSecrets.token
                    })

                } catch (err) {
                    Logger.error(err);
                    return Response.InternalError();
                }

            default:
                Logger.error("Route mismatch ...");
                return renderer.errorView(HTTP_NOT_FOUND);
        }
    } else {
        Logger.error("UNDEFINED !!! Event  Following is context ...");
        Logger.log(context);
        return renderer.errorView(HTTP_INTERNAL_SERVER_ERROR);
    }
}
