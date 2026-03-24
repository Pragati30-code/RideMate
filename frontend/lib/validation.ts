import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters")
});

export const registerSchema = z.object({
  name: z.string().min(2, "Name required"),
  email: z.string().email("Enter a valid email"),
  phoneNumber: z
    .string()
    .regex(/^[0-9]{10}$/, "Phone number must be exactly 10 digits"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  studentId: z.string().min(1, "Student ID is required"),
  gender: z.enum(["Male", "Female", "Other"], {
    message: "Please select a gender"
  })
});
