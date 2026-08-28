import api from "@/lib/axios";

/**
 * Strip codec suffixes so Laravel mimetypes validation accepts the file.
 * e.g. "audio/webm;codecs=opus" → "audio/webm"
 */
function baseMime(type, fallback) {
    if (!type || typeof type !== "string") return fallback;
    return type.split(";")[0].trim() || fallback;
}

/**
 * Build a File from a Blob/File so multipart upload has a proper filename + clean MIME.
 */
function toFile(blobOrFile, fallbackName, fallbackType) {
    const type = baseMime(blobOrFile?.type, fallbackType);
    const name =
        blobOrFile instanceof File && blobOrFile.name
            ? blobOrFile.name
            : fallbackName;

    if (blobOrFile instanceof File && baseMime(blobOrFile.type, "") === type) {
        return blobOrFile;
    }

    return new File([blobOrFile], name, { type });
}

/**
 * Submit a report. Accepts optional video/voice File/Blob attachments.
 * Uses multipart/form-data when media is present so Laravel can receive the files.
 */
export const submitReport = async (data) => {
    const { video, voice, ...fields } = data;
    const hasMedia = Boolean(video || voice);

    if (hasMedia) {
        const formData = new FormData();

        Object.entries(fields).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                formData.append(key, String(value));
            }
        });

        if (video) {
            formData.append(
                "video",
                toFile(video, `recording-${Date.now()}.webm`, "video/webm")
            );
        }

        if (voice) {
            // Prefer audio/webm; some browsers label pure-audio webm as video/webm
            const preferred =
                baseMime(voice?.type, "audio/webm").startsWith("video/")
                    ? "audio/webm"
                    : baseMime(voice?.type, "audio/webm");

            formData.append(
                "voice",
                toFile(voice, `voice-${Date.now()}.webm`, preferred)
            );
        }

        // Longer timeout for uploads (video can be large on slow networks)
        const response = await api.post("/recipient/reports", formData, {
            timeout: 120000, // 2 minutes
        });
        return response.data;
    }

    const response = await api.post("/recipient/reports", fields);
    return response.data;
};

export const submitEmergencySos = async (data) => {
    const response = await api.post("/recipient/emergency-sos", data);
    return response.data;
};

export const getRecipientReports = async () => {
    const response = await api.get("/recipient/reports");
    return response.data;
};

/**
 * Delete a report owned by the authenticated recipient.
 */
export const deleteRecipientReport = async (reportId) => {
    const response = await api.delete(`/recipient/reports/${reportId}`);
    return response.data;
};