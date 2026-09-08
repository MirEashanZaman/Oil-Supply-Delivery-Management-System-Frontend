import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { getPusherServer, ChatMessage } from "@/lib/pusher";

const MESSAGES_FILE = path.join(process.cwd(), "data", "messages.json");

function normalizeChannel(channel?: string | null) {
    const trimmed = (channel || "").trim();

    if (!trimmed || trimmed === "oil-supply-chat") {
        return "oil-supply-chat";
    }

    if (trimmed.startsWith("oil-supply-chat-")) {
        return "oil-supply-chat";
    }

    return trimmed;
}

function getRequestedChannel(channel?: string | null) {
    return normalizeChannel(channel);
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const requestedChannel = getRequestedChannel(searchParams.get("channel"));
        const messages = await readStoredMessages();
        const filteredMessages = requestedChannel === "oil-supply-chat"
            ? messages
            : messages.filter((message) => {
                const messageChannel = normalizeChannel(message.channel);
                return messageChannel === requestedChannel || (
                    requestedChannel !== "oil-supply-chat" &&
                    messageChannel === "oil-supply-chat"
                );
            });

        return NextResponse.json({
            success: true,
            data: filteredMessages.slice(0, 50),
        });
    } catch (err: any) {
        console.error("Error reading saved messages:", err);
        return NextResponse.json(
            { success: false, error: err.message || "Unable to load messages" },
            { status: 500 }
        );
    }
}

async function readStoredMessages(): Promise<ChatMessage[]> {
    try {
        const fileText = await fs.readFile(MESSAGES_FILE, "utf8");
        const parsed = JSON.parse(fileText);

        if (!Array.isArray(parsed)) {
            return [];
        }

        return parsed.map((message: any) => ({
            ...message,
            channel: normalizeChannel(message.channel),
        }));
    } catch {
        return [];
    }
}

async function writeStoredMessages(messages: ChatMessage[]) {
    await fs.mkdir(path.dirname(MESSAGES_FILE), { recursive: true });
    await fs.writeFile(MESSAGES_FILE, JSON.stringify(messages, null, 2), "utf8");
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { sender, email, role, topic, message, channel } = body;
        const normalizedChannel = getRequestedChannel(channel || "oil-supply-chat");

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
            channel: normalizedChannel,
        };

        const existingMessages = await readStoredMessages();
        const normalizedExistingMessages = existingMessages.map((message) => ({
            ...message,
            channel: normalizeChannel(message.channel),
        }));
        const updatedMessages = [messageData, ...normalizedExistingMessages].slice(0, 200);
        await writeStoredMessages(updatedMessages);

        const pusherServer = getPusherServer();
        if (pusherServer) {
            try {
                await pusherServer.trigger(normalizedChannel, "new-message", messageData);
            } catch (pusherErr) {
                console.warn("Pusher server trigger error (falling back to persisted message):", pusherErr);
            }
        }

        return NextResponse.json({
            success: true,
            data: messageData,
            status: "Message saved and transmitted via PusherJS network",
        });
    } catch (err: any) {
        console.error("Error in /api/messages route:", err);
        return NextResponse.json(
            { success: false, error: err.message || "Internal server error" },
            { status: 500 }
        );
    }
}
