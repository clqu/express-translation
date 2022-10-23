# @clqu/express-translation

[![NPM Version][npm-version-image]][npm-url]
[![NPM Downloads][npm-downloads-image]][node-url]

## Installation

This is a [Node.js](https://nodejs.org/en/) module available through the
[npm registry](https://www.npmjs.com/). Installation is done using the
[`npm install` command](https://docs.npmjs.com/getting-started/installing-npm-packages-locally):

```sh
$ npm install @clqu/express-translation express-session
```
`express-session` is required module.

## Usage

```js
const app = require("express")();
const { Translation } = require("@clqu/express-translation");

const session = require("express-session"); // required module
const translation = new Translation({
    path: "./locales/%file", // ./locales/en-US.json
    defaultLanguage: "en-US"
});

// Sequence is important, import after session.
app.set('trust proxy', 1);
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: { 
        secure: false 
    },
}));

app.use(translation.use);

app.get("/", (req, res) => {
    res.send(req.t("hello"));
});

app.get("/languages", (req, res) => {
    res.send(req.getLanguages());
});

app.get('/addLanguage', (req, res) => {
    req.addLanguage('tr-TR');
    res.send('Added language');
});

app.get('/setLanguage', (req, res) => {
    req.setLanguage('tr-TR');
    res.send(req.t('hello'));
});

app.listen(3000, () => {
    console.log("Server started on port 3000");
});
```
## Interface

```js
interface Request {
    t: (key: any) => void;
    language: string;
    addLanguage: (language: string) => void;
    getLanguages: () => void;
    setLanguage: (language: string) => void;
}
```

## License

[MIT](LICENSE)

[node-url]: https://nodejs.org/en/download
[npm-downloads-image]: https://badgen.net/npm/dm/@clqu/express-translation
[npm-url]: https://npmjs.org/package/@clqu/express-translation
[npm-version-image]: https://badgen.net/npm/v/@clqu/express-translation