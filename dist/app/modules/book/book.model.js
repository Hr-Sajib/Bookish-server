"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookModel = void 0;
const mongoose_1 = require("mongoose");
const bookSchema = new mongoose_1.Schema({
    title: {
        type: String,
        required: [true, "Book title is required"],
        trim: true,
        maxlength: [200, "Title cannot exceed 200 characters"],
    },
    shortDescription: {
        type: String,
        required: [true, "Short description is required"],
        trim: true,
        maxlength: [300, "Short description cannot exceed 300 characters"],
    },
    longDescription: {
        type: String,
        required: [true, "Long description is required"],
        trim: true,
    },
    authorName: {
        type: String,
        required: [true, "Author name is required"],
        trim: true,
    },
    publishingYear: {
        type: String,
        required: [true, "Publishing year is required"],
        trim: true,
        match: [/^\d{4}$/, "Publishing year must be a 4-digit number"],
    },
    postCreatorId: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true,
        ref: "User", // assumes you have a User model
    },
    postCreatorName: {
        type: String,
        required: [true, "Creator name is required"],
        trim: true,
    },
    coverUrl: {
        type: String,
        required: [true, "Cover image url is required"],
        trim: true,
    },
    postCreatorDesignation: {
        type: String,
        // required: [true, "Creator designation is required"],
        trim: true,
    },
}, {
    timestamps: true, // adds createdAt and updatedAt
    versionKey: false,
});
exports.BookModel = (0, mongoose_1.model)("Book", bookSchema);
