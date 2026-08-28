import { z } from "zod";

export const verifySchema = z.object({
    id_number: z.string().min(1, "User ID is required"),
    first_name: z.string().min(1, "First name is required"),
    last_name: z.string().min(1, "Last name is required"),
});

export const registerSchema = z
    .object({
        id_number: z.string().min(1),
        first_name: z.string().min(1),
        last_name: z.string().min(1),
        contact_number: z.string().min(1, "Contact number is required"),
        email: z.string().min(1, "Email is required").email("Enter a valid email"),
        password: z.string().min(8, "Password must be at least 8 characters"),
        password_confirmation: z.string().min(1, "Please confirm your password"),
    })
    .refine((data) => data.password === data.password_confirmation, {
        message: "Passwords do not match",
        path: ["password_confirmation"],
    });

export const requestAccessSchema = z.object({
    id_number: z.string().min(1),
    first_name: z.string().min(1),
    last_name: z.string().min(1),
    email: z.string().min(1, "Email is required").email("Enter a valid email"),
});