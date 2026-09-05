import PusherClient from "pusher-js";
import PusherServer from "pusher";

// Client-side Pusher instance for subscribing to real-time events in React components
let clientInstance: PusherClient | null = null;

export const getPusherClient = (): PusherClient => {
    if (typeof window === "undefined") {
        // Server-side guard
        return null as unknown as PusherClient;
    }

    if (!clientInstance) {
        const appKey = process.env.NEXT_PUBLIC_PUSHER_KEY || "pusher_sandbox_key";
        const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "ap1";

        clientInstance = new PusherClient(appKey, {
            cluster,
            forceTLS: true,
        });
    }

    return clientInstance;
};

// Server-side Pusher instance for triggering events from Next.js API route
let serverInstance: PusherServer | null = null;

export const getPusherServer = (): PusherServer | null => {
    const appId = process.env.PUSHER_APP_ID;
    const key = process.env.NEXT_PUBLIC_PUSHER_KEY;
    const secret = process.env.PUSHER_SECRET;
    const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "ap1";

    if (!appId || !key || !secret || key === "pusher_sandbox_key") {
        return null; // Signals sandbox/fallback mode
    }

    if (!serverInstance) {
        serverInstance = new PusherServer({
            appId,
            key,
            secret,
            cluster,
            useTLS: true,
        });
    }

    return serverInstance;
};

export interface ChatMessage {
    id: string;
    sender: string;
    email?: string;
    role?: string;
    topic?: string;
    message: string;
    timestamp: string;
    channel?: string;
}
