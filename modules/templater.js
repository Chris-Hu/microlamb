import fs from "node:fs";

export class Templater {
    templates = new Map();
    staticLocation = '';

    constructor(templates, staticLocation = '') {
        this.initTemplates(templates);
        this.staticLocation = staticLocation;
    }

    initTemplates(templates = new Map()) {
        templates.forEach((tpl, k, m) => {
            let content = fs.readFileSync(tpl, 'utf8');
            this.templates.set(k, content);
        })
    }

    template(tpl, values = new Map()) {
        if (!this.templates.has(tpl)) {
            throw new Error(` TEMPLATE NAME: ${tpl} NOT FOUND ...`);
        }
        let content = this.templates.get(tpl);
        values.forEach((data, tplVar, m) => {
            content = content.replaceAll(tplVar, data);
        })
        return content;
    }
}