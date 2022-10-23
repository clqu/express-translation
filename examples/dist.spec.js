const app = require("express")();
const { Translation } = require("../dist/src");

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