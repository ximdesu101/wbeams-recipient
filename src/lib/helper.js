//Alert Helper
export const SEVERITY_VARIANT = {
    low: "secondary",
    medium: "default",
    high: "destructive",
    critical: "destructive",
};

export const timeAgo = (dateString) => {
    const diffMs = Date.now() - new Date(dateString).getTime();
    const minutes = Math.floor(diffMs / 60000);
    if (minutes < 1) return "just now";
    if (minutes < 60) return `${minutes} min${minutes === 1 ? "" : "s"} ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days === 1 ? "" : "s"} ago`;
};

//Report Helper
export const urgencies = [
    { value: "low", title: "Low" },
    { value: "medium", title: "Medium" },
    { value: "high", title: "High" },
    { value: "critical", title: "Critical" },
];

export const initialFormState = {
    location: "",
    title: "",
    urgency: "low",
};

export const statusVariant = {
    pending: "secondary",
    approved: "success",
    rejected: "destructive",
};