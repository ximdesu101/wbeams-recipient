import api from "@/lib/axios";

export async function getAlertFeedback(alertId) {
    const response = await api.get(`/recipient/alerts/${alertId}/feedback`);
    return response.data?.data ?? null;
}

export async function submitAlertFeedback({ alertId, rating, comment = "" }) {
    const response = await api.post(`/recipient/alerts/${alertId}/feedback`, {
        rating,
        comment: comment?.trim() || null,
    });
    return response.data?.data ?? response.data;
}

export async function getOperatorFeedback() {
    const response = await api.get("/recipient/feedback/operator");
    return response.data?.data ?? null;
}

export async function submitOperatorFeedback({ rating, comment = "", operator_id = null }) {
    const response = await api.post("/recipient/feedback/operator", {
        rating,
        comment: comment?.trim() || null,
        operator_id,
    });
    return response.data?.data ?? response.data;
}

export async function getSystemFeedback() {
    const response = await api.get("/recipient/feedback/system");
    return response.data?.data ?? null;
}

export async function submitSystemFeedback({ rating, comment = "" }) {
    const response = await api.post("/recipient/feedback/system", {
        rating,
        comment: comment?.trim() || null,
    });
    return response.data?.data ?? response.data;
}

export async function getAllFeedback(params = {}) {
    const response = await api.get("/admin/feedback", { params });
    return response.data?.data ?? [];
}

export async function getFeedbackStats() {
    const response = await api.get("/admin/feedback/stats");
    return response.data?.data ?? {};
}

export async function getFeedbackDetail(type, id) {
    const response = await api.get(`/admin/feedback/${type}/${id}`);
    return response.data?.data ?? null;
}
