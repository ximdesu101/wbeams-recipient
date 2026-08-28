import api from "@/lib/axios";

export const getRecipientAlerts = async () => {
    const response = await api.get("/recipient/alerts");
    return response.data;
};

export const getPendingAlerts = async () => {
    const response = await api.get("/recipient/alerts/pending");
    return response.data;
};

export const getUnreadAlertCount = async () => {
    const response = await api.get("/recipient/alerts/unread-count");
    return response.data;
};

export const markAlertRead = async (alertId) => {
    const response = await api.patch(`/recipient/alerts/${alertId}/read`);
    return response.data;
};

export const markAllAlertsRead = async () => {
    const response = await api.patch("/recipient/alerts/read-all");
    return response.data;
};

export const submitAlertFeedback = async ({ alertId, rating, comment }) => {
    const response = await api.post(`/recipient/alerts/${alertId}/feedback`, {
        rating,
        comment,
    });
    return response.data;
};