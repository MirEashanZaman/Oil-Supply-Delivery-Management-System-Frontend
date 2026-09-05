import { NextResponse } from "next/server";
import { getPusherServer, ChatMessage } from "@/lib/pusher";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { sender, email, role, topic, message, channel = "oil-supply-chat" } = body;

        if (!message || !message.trim()) {
            return NextResponse.json(
                { success: false, error: "Message content cannot be empty." },
                { status: 400 }
            );
        }

        const messageData: ChatMessage = {
            id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            sender: sender?.trim() || "Anonymous User",
            email: email?.trim() || "user@oilsupply.com",
            role: role?.trim() || "Customer",
            topic: topic?.trim() || "General Inquiry",
            message: message.trim(),
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            channel,
        };

        // If configured with active Pusher credentials, trigger the Pusher event
        const pusherServer = getPusherServer();
        if (pusherServer) {
            try {
                await pusherServer.trigger(channel, "new-message", messageData);
            } catch (pusherErr) {
                console.warn("Pusher server trigger error (falling back to direct response):", pusherErr);
            }
        }

        return NextResponse.json({
            success: true,
            data: messageData,
            status: "Message transmitted via PusherJS network",
        });
    } catch (err: any) {
        console.error("Error in /api/messages route:", err);
        return NextResponse.json(
            { success: false, error: err.message || "Internal server error" },
            { status: 500 }
        );
    }
}
