import {
    HTTP_BAD_REQUEST,
    HTTP_INTERNAL_SERVER_ERROR,
    HTTP_OK,
    HTTP_NOT_AUTHORIZED,
    HTTP_FORBIDDEN,
    HTTP_NOT_FOUND,
    HEADERS
} from './http-consts.js';

class Response {
    static #dynamicHeaders = null;
    static headers = HEADERS.contentType.JSON;
    static _BASE_64_KEY = 'isBase64Encoded';
    static isBase64 = false;

    static getHeaders() {
      let headers = Response.#dynamicHeaders !== null ? Response.#dynamicHeaders : Response.headers;
      Response.#dynamicHeaders = null;
      return headers;
    }

    static addHeaders(headers) {
        Response.#dynamicHeaders = {...Response.headers, ...headers};
        return Response;
    }

    static withHeaders(headers) {
        Response.#dynamicHeaders = headers;
        return Response;
    }

    static withBase64(toggle = true) {
        Response.isBase64 = toggle
        return Response;
    }

    static OK(body = undefined) {
        return Response.ON_THE_FLY(HTTP_OK, body);
    }

    static BadRequest(body = undefined, isJSON = true) {
        return body === undefined ? {
            "statusCode": HTTP_BAD_REQUEST,
            "headers": Response.getHeaders(),
            "body": isJSON ? JSON.stringify({
                success: false,
                message: 'bad fields'
            }) : body
        } : {
            "statusCode": HTTP_BAD_REQUEST,
            "headers": Response.getHeaders(),
            "body": isJSON ? JSON.stringify(body) : body
        }
    }

    static NotFound(body = undefined, isJSON = true) {
        return body === undefined ? RESP_NOT_FOUND : {
            "statusCode": HTTP_NOT_FOUND,
            "headers": Response.getHeaders(),
            "body": isJSON ? JSON.stringify(body) : body
        }
    }

    static Forbidden(body = undefined, isJSON = true) {
        return body === undefined ? RESP_FORBIDDEN : {
            "statusCode": HTTP_FORBIDDEN,
            "headers": Response.getHeaders(),
            "body": isJSON ? JSON.stringify(body) : body
        }
    }

    static Unauthorized(body = undefined, isJSON = true) {
        return body === undefined ? RESP_NOT_AUTHORIZED : {
            "statusCode": HTTP_NOT_AUTHORIZED,
            "headers": Response.getHeaders(),
            "body": isJSON ? JSON.stringify(body) : body
        }
    }

    static InternalError(body = undefined, isJSON = true) {
        return body === undefined ? RESP_INTERNAL_ERROR : {
            "statusCode": HTTP_INTERNAL_SERVER_ERROR,
            "headers": Response.getHeaders(),
            "body": isJSON ? JSON.stringify(body) : body
        }
    }

    static ON_THE_FLY(statusCode = HTTP_OK, body = undefined, parse = false) {
        if (body === undefined) {
            return {
                'statusCode': statusCode,
                'headers': Response.getHeaders(),
            };
        }

        const baseResponse = {
            'statusCode': statusCode,
            'headers': Response.getHeaders(),
            'body': parse ? body : JSON.stringify(body),
        };

        if (Response.isBase64) {
            baseResponse[Response._BASE_64_KEY] = true;
            return baseResponse;
        }
        return baseResponse;
    }
}

const RESP_FORBIDDEN = {
    "statusCode": HTTP_FORBIDDEN,
    "headers": Response.getHeaders(),
    "body": ""
};

const RESP_NOT_AUTHORIZED = {
    "statusCode": HTTP_NOT_AUTHORIZED,
    "headers": Response.getHeaders(),
    "body": ""
};

const RESP_NOT_FOUND = {
    "statusCode": HTTP_NOT_FOUND,
    "headers": Response.getHeaders(),
    "body": ""
};


const RESP_INTERNAL_ERROR = {
    "statusCode": HTTP_INTERNAL_SERVER_ERROR,
    "headers": Response.headers,
    "body": ""
};

export {
    RESP_NOT_AUTHORIZED,
    RESP_FORBIDDEN,
    RESP_INTERNAL_ERROR,
    Response
}

