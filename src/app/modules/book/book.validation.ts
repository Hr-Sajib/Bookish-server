import { z } from "zod";

// 🟢 Validation schema for creating a book post
const createBookValidationSchema = z.object({
  body: z.object({
    title: z
      .string()
      .trim()
      .min(1, { message: "Title is required" })
      .max(100, { message: "Title cannot exceed 100 characters" }),

    shortDescription: z
      .string()
      .trim()
      .min(1, { message: "Short description is required" })
      .max(300, { message: "Short description cannot exceed 300 characters" }),

    longDescription: z
      .string()
      .trim()
      .min(1, { message: "Long description is required" }),

    authorName: z
      .string()
      .trim()
      .min(1, { message: "Author name is required" })
      .max(50, { message: "Author name cannot exceed 50 characters" }),

    publishingYear: z
      .string()
      .regex(/^\d{4}$/, { message: "Publishing year must be a 4-digit number" }),
  }),
});

// 🟠 Validation schema for updating a book post (partial)
const updateBookValidationSchema = z.object({
  body: z
    .object({
      title: z
        .string()
        .trim()
        .min(1, { message: "Title cannot be empty" })
        .max(100, { message: "Title cannot exceed 100 characters" })
        .optional(),

      shortDescription: z
        .string()
        .trim()
        .min(1, { message: "Short description cannot be empty" })
        .max(300, { message: "Short description cannot exceed 300 characters" })
        .optional(),

      longDescription: z
        .string()
        .trim()
        .min(1, { message: "Long description cannot be empty" })
        .optional(),

      authorName: z
        .string()
        .trim()
        .min(1, { message: "Author name cannot be empty" })
        .max(50, { message: "Author name cannot exceed 50 characters" })
        .optional(),

      publishingYear: z
        .string()
        .regex(/^\d{4}$/, { message: "Publishing year must be a 4-digit number" })
        .optional(),
    })
    .strict(), // disallow extra fields
});

export const BookPostValidations = {
  createBookValidationSchema,
  updateBookValidationSchema,
};
