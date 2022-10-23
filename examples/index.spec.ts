import express from "express";
const app = express();
import { Translation } from "../src";

import session from "express-session";
const translation = new Translation({
    path: "./locales/%file",
    defaultLanguage: "en-US"
});

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
    req.addLanguage('es-ES');
    res.send('Added language');
});

app.get('/setLanguage', (req, res) => {
    req.setLanguage('es-ES');
    res.send(req.t('hello'));
});

app.get('/views', async (req, res) => {
    if (req.session.views) req.session.views++;
    else req.session.views = 1;

    res.send(`You have visited this page ${req.session.views} times`);
});

app.listen(3000, () => {
    console.log("Server started on port 3000");
});


declare module 'express-session' {
    export interface SessionData {
        views: number;
    }
}