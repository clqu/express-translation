import { NextFunction, Request, Response } from "express";
import fs from "fs";
const defaultJSON = JSON.stringify({
    "$init": {
        "language": "%langName%",
        "createdAt": "%createdAt%"
    },
    "hello": "Hello, world!"
});

export class Translation {
    path: string;
    defaultLanguage: string;

    constructor({ path = "./src/locales/%file", defaultLanguage = "en-US" }: { path: string, defaultLanguage: string }) {
        if (!path.includes("%file")) throw new Error("Path must include %file");
        if (!path.endsWith("%file")) throw new Error("Path must end with %file");
        if (path.startsWith("%file")) throw new Error("Path must not start with %file");

        const dir = path.split('%file')[0];
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }

        if (!fs.existsSync(path.replace('%file', `${defaultLanguage}.json`))) {
            console.log(`Default language file not found. Creating ${defaultLanguage}.json...`);
            fs.writeFile(path.replace('%file', `${defaultLanguage}.json`), defaultJSON.replace('%langName%', defaultLanguage).replace('%createdAt%', new Date().toUTCString()), (err) => {
                if (err) throw err;
                console.log(`Created ${defaultLanguage}.json`);
            });
        }

        this.path = path;
        this.defaultLanguage = defaultLanguage;

        this.use = this.use.bind(this);
        return this;
    }

    async use(req: Request, res: Response, next: NextFunction) {
        if (!req.session) throw new Error("Translation middleware requires express-session");

        if (!req.session.language) {
            const lang = req.headers['accept-language'] || this.defaultLanguage;
            if (!fs.existsSync(this.path.replace('%file', `${lang}.json`))) {
                const defaultLang = fs.readFileSync(this.path.replace('%file', `${this.defaultLanguage}.json`));
                req.session.language = JSON.parse(defaultLang.toString());
                await req.session.save();
            } else {
                const langFile = fs.readFileSync(this.path.replace('%file', `${lang}.json`));
                req.session.language = JSON.parse(langFile.toString());
                await req.session.save();
            }
        }

        req.addLanguage = (language: string) => {
            if (!fs.existsSync(this.path.replace('%file', `${language}.json`))) {
                fs.writeFile(this.path.replace('%file', `${language}.json`), defaultJSON
                    .replace(/\%langName\%/g, language)
                    .replace(/\%createdAt\%/g, new Date().toString()), async (err) => {
                        if (err) {
                            console.log(err);
                        }

                        req.session.language = JSON.parse(defaultJSON.replace(/\%langName\%/g, language).replace(/\%createdAt\%/g, new Date().toString()));
                        await req.session.save();
                    });
            } else {
                fs.readFile(this.path.replace('%file', `${language}.json`), async (err, data) => {
                    if (!err) {
                        req.session.language = JSON.parse(data.toString());
                        await req.session.save();
                    }
                });
            }
        };

        req.setLanguage = async (language: string) => {
            if (!fs.existsSync(this.path.replace('%file', `${language}.json`))) {
                const defaultLang = fs.readFileSync(this.path.replace('%file', `${this.defaultLanguage}.json`));
                req.session.language = JSON.parse(defaultLang.toString());
                await req.session.save();
            } else {
                const langFile = fs.readFileSync(this.path.replace('%file', `${language}.json`));
                req.session.language = JSON.parse(langFile.toString());
                await req.session.save();
            }
        };

        req.t = (key: any) => {
            const lang = req.session.language;
            if (key.includes(".")) {
                const keys: any[] = key.split(".");
                let label: any = "";
                for (let i = 0; i < keys.length; i++) {
                    if (i === 0) {
                        label = lang[keys[i]];
                    } else {
                        label = label[keys[i]];
                    }
                }
                return label;
            } else {
                return lang[key];
            }
        };

        req.getLanguages = () => {
            const files = fs.readdirSync(this.path.split('%file')[0]);
            const languages: string[] = [];
            for (let i = 0; i < files.length; i++) {
                if (files[i].endsWith(".json")) {
                    const init = JSON.parse(fs.readFileSync(this.path.split('%file')[0] + files[i]).toString())?.["$init"] || this.path.split('%file')[0] + files[i];
                    languages.push(init);
                }
            }

            return languages;
        };

        next();
    }
}

declare global {
    namespace Express {
        interface Request {
            t: (key: any) => void;
            language: string;
            addLanguage: (language: string) => void;
            getLanguages: () => void;
            setLanguage: (language: string) => void;
        }

    }
};

declare module 'express-session' {
    export interface SessionData {
        language: any;
    }
}