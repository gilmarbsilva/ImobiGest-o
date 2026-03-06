import { createApp } from "../server";

let cachedApp: any = null;

export default async function handler(req: any, res: any) {
    try {
        if (!cachedApp) {
            cachedApp = await createApp();
        }
        return cachedApp(req, res);
    } catch (error: any) {
        console.error("Vercel Function Error:", error);
        res.status(500).json({
            error: "Internal Server Error",
            message: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
}
