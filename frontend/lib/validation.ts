import { z } from "zod";

const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{6,}$/;
const nameRegex = /^[A-Za-z][A-Za-z\s'-]{1,}$/;
const phoneRegex = /^[6-9][0-9]{9}$/;
const studentIdRegex = /^[0-9]{11}$/;

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z.object({
  name: z
    .string()
    .min(2, "Name required")
    .regex(nameRegex, "Name can only contain letters, spaces, hyphens, or apostrophes"),
  email: z
    .string()
    .min(1, "Email is required")
    .regex(emailRegex, "Enter a valid email"),
  phoneNumber: z
    .string()
    .regex(phoneRegex, "Enter a valid 10-digit mobile number"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .regex(
      passwordRegex,
      "Password must include uppercase, lowercase, number, and special character"
    ),
  studentId: z
    .string()
    .min(1, "Student ID is required")
    .regex(studentIdRegex, "Student ID must be exactly 11 digits"),
  gender: z.enum(["Male", "Female", "Other"], {
    message: "Please select a gender",
  }),
});
