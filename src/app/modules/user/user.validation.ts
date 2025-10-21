import { z } from "zod";

// Validation schema for creating a new user (wrapped in `body`)
const createUserValidationSchema = z.object({
  body: z.object({
    userName: z
      .string()
      .trim()
      .min(1, { message: "Username cannot be empty" })
      .max(12, { message: "Username cannot exceed 12 characters" }),
    email: z
      .string()
      .trim()
      .email({ message: "Invalid email format" })
      .toLowerCase(),
    password: z
      .string()
      .min(4, { message: "Password must be at least 4 characters long" }),
    phone: z
      .string()
      .length(14, { message: "Phone number must be exactly 14 characters long" })
      .refine((value) => value.startsWith("+8801"), {
        message: "Phone number must start with +8801",
      }),
  }),
});

// Validation schema for updating a user (partial, wrapped in `body`)
const updateUserValidationSchema = z.object({
  body: z
    .object({
      userName: z
        .string()
        .trim()
        .min(1, { message: "Username cannot be empty" })
        .max(12, { message: "Username cannot exceed 12 characters" })
        .optional(),
      email: z
        .string()
        .trim()
        .email({ message: "Invalid email format" })
        .toLowerCase()
        .optional(),
      phone: z
        .string()
        .length(14, { message: "Phone number must be exactly 14 characters long" })
        .refine((value) => value.startsWith("+8801"), {
          message: "Phone number must start with +8801",
        })
        .optional(),
    })
    .strict(), // prevent extra fields
});

export const UserValidations = {
  createUserValidationSchema,
  updateUserValidationSchema,
};
