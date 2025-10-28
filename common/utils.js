import fs from 'node:fs';
import {Buffer} from 'node:buffer';
//TODO Add utils package.json
import {v4 as uuidv4} from 'uuid';


const { createHash } = await import('node:crypto');


const nocaretUuid = (nocaret = true) => {
    let id = uuidv4();
    return nocaret ? id.replace(/-/g, '') : id;
}

export const dropAccent = (str, upperCase = true) => {
    const chars = {
        'à': 'a', 'â': 'a', 'ä': 'a', 'î': 'i', 'ï': 'i',
        'é': 'e', 'è': 'e', 'ê': 'e', 'ô': 'o', 'ö': 'o',
        'ü': 'u', 'û': 'u', 'ç': 'c',
        "'": ' '
    }

    const map = new Map(Object.entries(chars));
    map.forEach((repl, char, map) => {
        str = str.replace(char, repl);
    });

    str = str.replaceAll(/\(\w+\)/ig, '');
    return upperCase ? str.trim().toUpperCase() : str.trim();
};

export const isObject = (objValue, acceptNull = false) => {
    let acceptN;
    let check;
    if (acceptNull) {
        acceptN = objValue === null;
        check = true;
    } else {
        acceptN = objValue.constructor === Object;
        check = !!objValue;
    }
    return check && typeof objValue === 'object' && acceptN;
}

export const isJSON = (str, acceptNull = false) => {
    try {
        return isObject(JSON.parse(str), acceptNull);
    } catch (e) {
        Logger.error(`NOT VALID JSON ${str} `);
        return false;
    }
}

export const uuid = (nocaret = true) => nocaretUuid(nocaret)

export const capitalize = (word) => {
    return `${word.charAt(0).toUpperCase()}${word.slice(1)}`
}

export const hashIt = (spice, data) => {
    if (createHash !== undefined && (createHash instanceof Function)) {
        try {
            const hash = createHash('sha256')
                .update(data)
                .update(spice !== null ? spice : '')
                .digest('hex');
            return hash;
        } catch (e) {
            Logger.error(e);
        }
    }
}

export class Base64 {
    static decode = (data) => {
        return Buffer.from(data, 'base64').toString('utf8');
    }

    static encode = (data) => {
        return Buffer.from(data, 'utf8').toString('base64');
    }
}

export const isArrayNotEmpty = (arr) => {
    return Array.isArray(arr) && arr.length > 0;
}

export const decompUrl = (url) => {
    try {
        let {
            host,
            port,
            path
        } = /.*:\/\/(www\.)?(?<host>([a-z0-9\.\-]*)|([0-9]+\.[0-9]+\.[0-9]+\.[0-9]+.*)):?(?<port>[0-9]{4})?\/(?<path>.*)\/?/.exec(
            url,
        ).groups;


        return (port) ?
            {
                host: `${host}`,
                port: port,
                path: `/${path}`
            }
            :
            {
                host: host,
                port: null,
                path: `/${path}`
            }

    } catch (e) {
        console.error('[ ERR ] ' + e);
        return undefined;
    }
}

/**
 * exclusive Maximum and inclusive Minimum
 * @param {int} min
 * @param {int} max
 * @returns
 */
export const randomInt = (min, max) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min);
}

export class Loggerty {
    constructor() {
    }

    #format(msg, noTime) {
        return noTime ? JSON.stringify(msg) : (new Date()).toISOString() + ' - ' + JSON.stringify(msg);
    }

    error(msg, verbose = true) {
        if (verbose)
            console.error(msg);
        else
            console.error('[ ERR ] ' + this.#format(msg));
    }

    debug(msg, noTime = true) {
        console.info('[ DEBUG ] ' + this.#format(msg, noTime));
    }

    info(msg) {
        console.info('[ INFO ] ' + this.#format(msg));
    }

    log(msg, format = true) {
        if (format)
            console.log(this.#format(msg));
        else
            console.dir(msg);
    }

    warn(msg) {
        console.warn('[ WARN ] ' + this.#format(msg));
    }
}

export class Config {
    config;
    file;

    constructor(file) {
        this.file = file;
        this.config = jsonOBJ.loadFromFile(file);
    }

    has(key) {
        if (key.indexOf('.') < 0) {
            return Object.hasOwn(this.config, key);
        }

        return this.getOrNull(key) !== null;
    }

    get(key) {
        let res = jsonOBJ.fetch(this.config, key);
        if (res === undefined) {
            throw Error(`${key} is not found in config file ${this.file}`);
        }

        return res;
    }

    getOrNull(key) {
        let res = jsonOBJ.fetch(this.config, key);
        if (res === undefined) {
            return null;
        }

        return res;
    }
}

export const jsonOBJ = {
    toObj: (value) => isObject(value)
        ? value
        : jsonOBJ.isParseable(value) ? JSON.parse(value) : {},
    isParseable: (str) => {
        try {
            JSON.parse(str);
        } catch (e) {
            return false;
        }
        return true;
    },
    isValid: (obj) => isObject(obj),
    isEmpty: (obj) => {
        return isObject(obj) && Object.keys(obj).length === 0
    },
    has: (obj, key) => {
        return Object.hasOwn(obj, key);
    },
    get: (obj, key) => {
        let found = jsonOBJ.has(obj, key) ? obj[key] : undefined;
        if (found === undefined) {
            throw Error(`${key} IS NOT FOUND in structure ${JSON.stringify(obj, null, 2)} `);
        }
        return found;
    },
    fetch: (obj, key) => {
        if (!isObject(obj)) {
            Logger.error(`${obj} IS NOT AN OBJECT !`);
            return undefined;
        }

        let pathElts = key.split('.');
        if (pathElts.length === 1 && key in obj) {
            return obj[key];
        }

        if (pathElts.length > 0) {
            let ind = pathElts.length - 1;
            return jsonOBJ.path(obj, pathElts.slice(0, ind), pathElts[ind]);
        }
        throw Error(`${key} IS NOT ATTRIBUTE OF ${JSON.stringify(obj, null, 2)} `);
    },
    path: (obj, path, key) => {
        if (!isObject(obj)) {
            return undefined;
        }

        let next = {...obj};
        let split = Array.isArray(path) ? path : path.split('/');
        split.forEach(step => {
            if (step in next) {
                next = next[step];
            } else {
                next = null;
                return;
            }

        });
        return next === null ? undefined : jsonOBJ.get(next, key);
    },
    loadFromFile: (file) => {
        return JSON.parse(fs.readFileSync(file, {encoding: 'utf8', flag: 'r'}));
    }
};

export const FileType = {
    XLS: {
        name: "xls",
        mime: "application/vnd.ms-excel"
    },
    PNG: {
        name: "png",
        mime: "image/x-png"
    },
    get: (key) => {
        if (FileType.XLS.name === key) return FileType.XLS
        if (FileType.PNG.name === key) return FileType.PNG
    }
};

export const datee = {
    ymdCaret: (dt) => {
        return `${dt.substr(0, 4)}-${dt.substr(4, 2)}-${dt.substr(6, 2)}`
    }
};

export const Logger = new Loggerty();



