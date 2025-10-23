"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthValidations = void 0;
const zod_1 = require("zod");
// Validation schema for login (wrapped in `body`)
const loginValidationSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z
            .string()
            .trim()
            .email({ message: "Invalid email format" })
            .toLowerCase(),
        password: zod_1.z
            .string()
            .min(4, { message: "Password must be at least 4 characters long" }),
    }),
});
exports.AuthValidations = {
    loginValidationSchema,
};
