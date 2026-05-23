import * as z from "zod";

export const identitySchema = z.object({
  fullName: z.string().min(5, "Full Name is required"),
  username: z.string().min(5, "Username must be at least 5 characters"),
  email: z.string().email("Invalid email address"),
});

export const securitySchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "Must be at least 8 characters"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export type IdentityFormValues = z.infer<typeof identitySchema>;
export type SecurityFormValues = z.infer<typeof securitySchema>;
