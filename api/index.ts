import { createApp } from "../server";

let cachedApp: any = null;

export default async function handler(req: any, res: any) {
    const requestId = Math.random().toString(36).substring(7);
    console.log(`[VERCEL-HANDLER][${requestId}] Request: ${req.method} ${req.url}`);

    try {
        // Basic Environment Check (Logged only, not leaked to client)
        const hasUrl = !!process.env.SUPABASE_URL;
        const hasKey = !!(process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY);
        console.log(`[VERCEL-HANDLER][${requestId}] Env Status: URL=${hasUrl}, Key=${hasKey}`);

        if (!cachedApp) {
            console.log(`[VERCEL-HANDLER][${requestId}] Creating app instance...`);
            cachedApp = await createApp();
        }

        return cachedApp(req, res);
    } catch (error: any) {
        console.error(`[VERCEL-HANDLER][${requestId}] CRASH:`, error);
        res.status(500).json({
            error: "Vercel Function Error",
            message: error.message,
            requestId,
            env: {
                hasUrl: !!process.env.SUPABASE_URL,
                hasKey: !!(process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY),
                node: process.version
            }
        });
    }
}
