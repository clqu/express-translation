import { NextFunction, Request, Response } from "express";
export declare class Translation {
    path: string;
    defaultLanguage: string;
    constructor({ path, defaultLanguage }: {
        path: string;
        defaultLanguage: string;
    });
    use(req: Request, res: Response, next: NextFunction): Promise<void>;
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
}
declare module 'express-session' {
    interface SessionData {
        language: any;
    }
}
