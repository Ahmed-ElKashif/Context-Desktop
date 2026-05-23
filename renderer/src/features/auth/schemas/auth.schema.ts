import { z } from "zod";

// --- Login Schema ---
export const loginSchema = z.object({
  email: z
    .string()
    .min(6, { message: "Identity (email) is required" })
    .email({ message: "Please enter a valid email address" }),
  password: z
    .string()
    .min(1, { message: "Access Key is required" })
    .min(8, { message: "Access Key must be at least 8 characters" }),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

// --- Register Schema ---
export const registerSchema = z.object({
  fullName: z
    .string()
    .min(5, { message: "Full Name is required" })
    .max(25, { message: "Name is too long" }),
  username: z
    .string()
    .min(5, { message: "Username must be at least 5 characters" })
    .regex(/^[a-zA-Z0-9_]+$/, {
      message: "Letters, numbers, and underscores only",
    }),
  email: z
    .string()
    .min(6, { message: "Email is required" })
    .email({ message: "Please enter a valid email address" }),
  password: z
    .string()
    .min(8, { message: "Master key must be at least 8 characters" })
    .regex(/[A-Z]/, { message: "Must contain at least one uppercase letter" })
    .regex(/[0-9]/, { message: "Must contain at least one number" }),
  persona: z.enum(["general", "professional", "student", "developer"]),
});

export type RegisterFormValues = z.infer<typeof registerSchema>;

// --- API Response Types ---
export interface AuthUser {
  id: string;
  fullName: string;
  username: string;
  email: string;
  persona: "general" | "professional" | "student" | "developer";
  avatar?: string;
  role: "user" | "admin"; // ← added
  lastActiveDocumentId?: string;
  lastActiveComparisonId?: string;
  hasCompletedTour?: boolean;
  hasCompletedPopulatedTour?: boolean;
  hasCompletedLibraryTour?: boolean;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: AuthUser;
}