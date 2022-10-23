"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Translation = void 0;
const fs_1 = __importDefault(require("fs"));
const defaultJSON = JSON.stringify({
    "$init": {
        "language": "%langName%",
        "createdAt": "%createdAt%"
    },
    "hello": "Hello, world!"
});
class Translation {
    path;
    defaultLanguage;
    constructor({ path = "./src/locales/%file", defaultLanguage = "en-US" }) {
        if (!path.includes("%file"))
            throw new Error("Path must include %file");
        if (!path.endsWith("%file"))
            throw new Error("Path must end with %file");
        if (path.startsWith("%file"))
            throw new Error("Path must not start with %file");
        const dir = path.split('%file')[0];
        if (!fs_1.default.existsSync(dir)) {
            fs_1.default.mkdirSync(dir);
        }
        if (!fs_1.default.existsSync(path.replace('%file', `${defaultLanguage}.json`))) {
            console.log(`Default language file not found. Creating ${defaultLanguage}.json...`);
            fs_1.default.writeFile(path.replace('%file', `${defaultLanguage}.json`), defaultJSON.replace('%langName%', defaultLanguage).replace('%createdAt%', new Date().toUTCString()), (err) => {
                if (err)
                    throw err;
                console.log(`Created ${defaultLanguage}.json`);
            });
        }
        this.path = path;
        this.defaultLanguage = defaultLanguage;
        this.use = this.use.bind(this);
        return this;
    }
    async use(req, res, next) {
        if (!req.session)
            throw new Error("Translation middleware requires express-session");
        if (!req.session.language) {
            const lang = req.headers['accept-language'] || this.defaultLanguage;
            if (!fs_1.default.existsSync(this.path.replace('%file', `${lang}.json`))) {
                const defaultLang = fs_1.default.readFileSync(this.path.replace('%file', `${this.defaultLanguage}.json`));
                req.session.language = JSON.parse(defaultLang.toString());
                await req.session.save();
            }
            else {
                const langFile = fs_1.default.readFileSync(this.path.replace('%file', `${lang}.json`));
                req.session.language = JSON.parse(langFile.toString());
                await req.session.save();
            }
        }
        req.addLanguage = (language) => {
            if (!fs_1.default.existsSync(this.path.replace('%file', `${language}.json`))) {
                fs_1.default.writeFile(this.path.replace('%file', `${language}.json`), defaultJSON
                    .replace(/\%langName\%/g, language)
                    .replace(/\%createdAt\%/g, new Date().toString()), async (err) => {
                    if (err) {
                        console.log(err);
                    }
                    req.session.language = JSON.parse(defaultJSON.replace(/\%langName\%/g, language).replace(/\%createdAt\%/g, new Date().toString()));
                    await req.session.save();
                });
            }
            else {
                fs_1.default.readFile(this.path.replace('%file', `${language}.json`), async (err, data) => {
                    if (!err) {
                        req.session.language = JSON.parse(data.toString());
                        await req.session.save();
                    }
                });
            }
        };
        req.setLanguage = async (language) => {
            if (!fs_1.default.existsSync(this.path.replace('%file', `${language}.json`))) {
                const defaultLang = fs_1.default.readFileSync(this.path.replace('%file', `${this.defaultLanguage}.json`));
                req.session.language = JSON.parse(defaultLang.toString());
                await req.session.save();
            }
            else {
                const langFile = fs_1.default.readFileSync(this.path.replace('%file', `${language}.json`));
                req.session.language = JSON.parse(langFile.toString());
                await req.session.save();
            }
        };
        req.t = (key) => {
            const lang = req.session.language;
            if (key.includes(".")) {
                const keys = key.split(".");
                let label = "";
                for (let i = 0; i < keys.length; i++) {
                    if (i === 0) {
                        label = lang[keys[i]];
                    }
                    else {
                        label = label[keys[i]];
                    }
                }
                return label;
            }
            else {
                return lang[key];
            }
        };
        req.getLanguages = () => {
            const files = fs_1.default.readdirSync(this.path.split('%file')[0]);
            const languages = [];
            for (let i = 0; i < files.length; i++) {
                if (files[i].endsWith(".json")) {
                    const init = JSON.parse(fs_1.default.readFileSync(this.path.split('%file')[0] + files[i]).toString())?.["$init"] || this.path.split('%file')[0] + files[i];
                    languages.push(init);
                }
            }
            return languages;
        };
        next();
    }
}
exports.Translation = Translation;
;
