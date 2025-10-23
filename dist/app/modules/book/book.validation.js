"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookPostValidations = void 0;
const zod_1 = require("zod");
// 🟢 Validation schema for creating a book post
const createBookValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        title: zod_1.z
            .string()
            .trim()
            .min(1, { message: "Title is required" })
            .max(100, { message: "Title cannot exceed 100 characters" }),
        shortDescription: zod_1.z
            .string()
            .trim()
            .min(1, { message: "Short description is required" })
            .max(300, { message: "Short description cannot exceed 300 characters" }),
        longDescription: zod_1.z
            .string()
            .trim()
            .min(1, { message: "Long description is required" }),
        authorName: zod_1.z
            .string()
            .trim()
            .min(1, { message: "Author name is required" })
            .max(50, { message: "Author name cannot exceed 50 characters" }),
        publishingYear: zod_1.z
            .string()
            .regex(/^\d{4}$/, { message: "Publishing year must be a 4-digit number" }),
    }),
});
// 🟠 Validation schema for updating a book post (partial)
const updateBookValidationSchema = zod_1.z.object({
    body: zod_1.z
        .object({
        title: zod_1.z
            .string()
            .trim()
            .min(1, { message: "Title cannot be empty" })
            .max(100, { message: "Title cannot exceed 100 characters" })
            .optional(),
        shortDescription: zod_1.z
            .string()
            .trim()
            .min(1, { message: "Short description cannot be empty" })
            .max(300, { message: "Short description cannot exceed 300 characters" })
            .optional(),
        longDescription: zod_1.z
            .string()
            .trim()
            .min(1, { message: "Long description cannot be empty" })
            .optional(),
        authorName: zod_1.z
            .string()
            .trim()
            .min(1, { message: "Author name cannot be empty" })
            .max(50, { message: "Author name cannot exceed 50 characters" })
            .optional(),
        publishingYear: zod_1.z
            .string()
            .regex(/^\d{4}$/, { message: "Publishing year must be a 4-digit number" })
            .optional(),
    })
        .strict(), // disallow extra fields
});
exports.BookPostValidations = {
    createBookValidationSchema,
    updateBookValidationSchema,
};
