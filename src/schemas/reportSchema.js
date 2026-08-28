import { z } from "zod";
import { LOCATION_NAMES } from "@/lib/campusLocations";

export const reportSchema = z.object({
    location: z
        .string()
        .min(1, "Location is required")
        .refine((value) => LOCATION_NAMES.includes(value), {
            message: "Please select a valid campus location",
        }),
    title: z
        .string()
        .min(1, "Report name is required")
        .max(255, "Report name must be 255 characters or less"),
    urgency: z.enum(["low", "medium", "high", "critical"]),
});