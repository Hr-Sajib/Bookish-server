"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserValidations = void 0;
const zod_1 = require("zod");
// Validation schema for creating a new user (wrapped in `body`)
const createUserValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        userName: zod_1.z
            .string()
            .trim()
            .min(1, { message: "Username cannot be empty" })
            .max(12, { message: "Username cannot exceed 12 characters" }),
        email: zod_1.z
            .string()
            .trim()
            .email({ message: "Invalid email format" })
            .toLowerCase(),
        password: zod_1.z
            .string()
            .min(4, { message: "Password must be at least 4 characters long" }),
        phone: zod_1.z
            .string()
            .length(14, { message: "Phone number must be exactly 14 characters long" })
            .refine((value) => value.startsWith("+8801"), {
            message: "Phone number must start with +8801",
        }),
        designation: zod_1.z
            .string()
            .max(30, { message: "Designation must be at max 30 characters long" })
    }),
});
// Validation schema for updating a user (partial, wrapped in `body`)
const updateUserValidationSchema = zod_1.z.object({
    body: zod_1.z
        .object({
        userName: zod_1.z
            .string()
            .trim()
            .min(1, { message: "Username cannot be empty" })
            .max(12, { message: "Username cannot exceed 12 characters" })
            .optional(),
        email: zod_1.z
            .string()
            .trim()
            .email({ message: "Invalid email format" })
            .toLowerCase()
            .optional(),
        phone: zod_1.z
            .string()
            .length(14, { message: "Phone number must be exactly 14 characters long" })
            .refine((value) => value.startsWith("+8801"), {
            message: "Phone number must start with +8801",
        })
            .optional(),
        designation: zod_1.z
            .string()
            .max(30, { message: "Designation must be at max 30 characters long" })
            .optional()
    })
        .strict(), // prevent extra fields
});
exports.UserValidations = {
    createUserValidationSchema,
    updateUserValidationSchema,
};
