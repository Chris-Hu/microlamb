const HTTP_INTERNAL_SERVER_ERROR = 500;
const HTTP_OK = 200;
const HTTP_BAD_REQUEST = 400;
const HTTP_NOT_AUTHORIZED = 401;
const HTTP_FORBIDDEN = 403;
const HTTP_NOT_FOUND = 404;

const HEADERS = {
    contentType: {
        JSON: {
            'Content-Type': 'application/json',
        },
        HTML: {
            'Content-Type': 'text/html'
        }
    }
}

const MIMES = {
    JSON: 'application/json'
}

const TYPES = {
    FILE: 'file',
    TEXT: 'text'
}

export {
    HEADERS,
    MIMES,
    TYPES,
    HTTP_BAD_REQUEST,
    HTTP_INTERNAL_SERVER_ERROR,
    HTTP_OK,
    HTTP_NOT_AUTHORIZED,
    HTTP_NOT_FOUND,
    HTTP_FORBIDDEN
}
