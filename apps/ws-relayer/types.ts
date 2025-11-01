export type MessagePayload = {
    event: "subscribe";
    data: {
        roomId: string;
    };
} | {
    event: "unsubscribe";
    data: {
        roomId: string;
    };
} | {
    event: "admin";
    data: {
        roomId: string;
        message: {
            type: "command" | "update-file"
            content: string;
            path?: string;
        };
    };
}