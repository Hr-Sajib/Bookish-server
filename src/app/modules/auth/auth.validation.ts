import { z } from "zod";

// Validation schema for login (wrapped in `body`)
const loginValidationSchema = z.object({
  body: z.object({
    email: z
      .string()
      .trim()
      .email({ message: "Invalid email format" })
      .toLowerCase(),
    password: z
      .string()
      .min(4, { message: "Password must be at least 4 characters long" }),
  }),
});

export const AuthValidations = {
  loginValidationSchema,
};
