import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
        Accept: "application/json",
    },
    // Default timeout; media uploads override this
    timeout: 30000,
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("recipient_token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    // FormData: must NOT set Content-Type manually.
    // The browser needs to add the multipart boundary.
    // Axios 1.x uses AxiosHeaders — delete both ways to be safe.
    if (typeof FormData !== "undefined" && config.data instanceof FormData) {
        if (typeof config.headers.set === "function") {
            config.headers.set("Content-Type", undefined);
        } else {
            delete config.headers["Content-Type"];
            delete config.headers["content-type"];
        }
    } else if (!config.headers["Content-Type"] && !config.headers["content-type"]) {
        // JSON requests only
        if (typeof config.headers.set === "function") {
            config.headers.set("Content-Type", "application/json");
        } else {
            config.headers["Content-Type"] = "application/json";
        }
    }

    return config;
});

export default api;
