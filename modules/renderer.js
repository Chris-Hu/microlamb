import {Response} from '../common/response.js';
import {
    HEADERS,
    HTTP_BAD_REQUEST,
    HTTP_FORBIDDEN,
    HTTP_INTERNAL_SERVER_ERROR,
    HTTP_NOT_AUTHORIZED,
    HTTP_NOT_FOUND,
    HTTP_OK
} from '../common/http-consts.js';

import fs from 'node:fs';
import {Templater} from './templater.js';

export class Renderer extends Templater {

    constructor(templates = new Map(), staticLocation = 'static') {
        super(templates,staticLocation)
    }

    #loadErrorPage(errorCode) {
        let pre = Math.round(errorCode / 10);
        let page = errorCode === 404 ? `${this.staticLocation}/404.html` : `${this.staticLocation}/${pre}x.html`;
        return this.#readStatic(page);
    }

    #readStatic(location) {
        let body = fs.readFileSync(location,
            {encoding: 'utf8', flag: 'r'});
        return body;
    }

    loadStatic(page) {
        let location = `${this.staticLocation}/${page}`
        return Response.withHeaders(HEADERS.contentType.HTML).ON_THE_FLY(HTTP_OK,this.#readStatic(location), true);
    }

    errorView(statusCode) {
        switch (statusCode) {
            case HTTP_BAD_REQUEST:
                return Response.withHeaders(HEADERS.contentType.HTML).BadRequest(this.#loadErrorPage(HTTP_BAD_REQUEST), false);
            case HTTP_NOT_FOUND:
                return Response.withHeaders(HEADERS.contentType.HTML).NotFound(this.#loadErrorPage(HTTP_NOT_FOUND), false);
            case HTTP_NOT_AUTHORIZED:
                return Response.withHeaders(HEADERS.contentType.HTML).Unauthorized(this.#loadErrorPage(HTTP_NOT_AUTHORIZED), false);
            case HTTP_FORBIDDEN:
                return Response.withHeaders(HEADERS.contentType.HTML).Forbidden(this.#loadErrorPage(HTTP_FORBIDDEN), false);
            case HTTP_INTERNAL_SERVER_ERROR:
                return Response.withHeaders(HEADERS.contentType.HTML).InternalError(this.#loadErrorPage(HTTP_INTERNAL_SERVER_ERROR), false);
            default:
                return Response.withHeaders(HEADERS.contentType.HTML).InternalError(this.#loadErrorPage(HTTP_INTERNAL_SERVER_ERROR), false);
        }
    }

    /**
     *
     * @param string
     * @param Map
     * @returns {*}
     */
    view(tpl, values = new Map()) {
        if (!this.templates.has(tpl)) {
            throw new Error(` TEMPLATE NAME: ${tpl} NOT FOUND ...`);
        }
        let content = this.template(tpl,values);

        return Response
            .withHeaders(HEADERS.contentType.HTML)
            .ON_THE_FLY(HTTP_OK, content, true);
    }
}
