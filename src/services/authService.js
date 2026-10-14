    import api from "@/lib/axios";

    export const verifyRecipient = async (data) => {
        const response = await api.post("recipient/verify", data);
        return response.data;
    };

    export const RecipientMe = async () => {
        const response = await api.get("recipient/me");
        return response.data;
    };

    export const registerRecipient = async (data) => {
        const response = await api.post("recipient/register", data);
        return response.data;
    };

    export const RecipientLogin = async (credentials) => {
        const response = await api.post("recipient/login", credentials);
        return response.data;
    }

    export const sendRecipientRegistrationCode = async (email) => {
        const response = await api.post("recipient/registration/send-code", { email });
        return response.data;
    };

    export const verifyRecipientRegistrationCode = async (email, code) => {
        const response = await api.post("recipient/registration/verify-code", { email, code });
        return response.data;
    };

    export const sendRecipientPasswordResetCode = async (email) => {
        const response = await api.post("recipient/password/send-reset-code", { email });
        return response.data;
    };

    export const resetRecipientPassword = async (data) => {
        const response = await api.post("recipient/password/reset", data);
        return response.data;
    };

    export const requestAccess = async (data) => {
        const response = await api.post("recipient/request-access", data);
        return response.data;
    };
