import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useSSE } from "./useSse";

const RECIPIENT_CHANNEL_QUERY_KEYS = {
    "recipient-alerts": [
        ["recipient-alerts"],
        ["recipient-alerts-unread-count"],
        ["recipient-alerts", "pending"],
    ],
    reports: [["recipient-reports"]],
};

/**
 * Single multiplexed SSE connection for the recipient app.
 * Mount once via useRecipientSSEReady in RecipientLayout.
 */
export function useRecipientSSE({ enabled = true } = {}) {
    const queryClient = useQueryClient();

    useSSE({
        endpoint: "/recipient/sse",
        getToken: () => localStorage.getItem("recipient_token"),
        enabled,
        onUpdate: ({ data }) => {
            const channel = data?.channel;
            if (!channel) return;

            const keys = RECIPIENT_CHANNEL_QUERY_KEYS[channel];
            if (!keys) return;

            keys.forEach((queryKey) => {
                queryClient.invalidateQueries({ queryKey });
            });
        },
        onError: (error) => {
            if (error.status === 401) {
                toast.error("Session expired. Please login again.");
            }
        },
    });
}

export function useRecipientSSEReady(delayMs = 1200) {
    const [sseReady, setSseReady] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => setSseReady(true), delayMs);
        return () => clearTimeout(timer);
    }, [delayMs]);

    useRecipientSSE({ enabled: sseReady });
}