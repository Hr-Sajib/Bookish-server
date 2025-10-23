"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookService = void 0;
const http_status_1 = __importDefault(require("http-status"));
const book_model_1 = require("./book.model");
const appError_1 = __importDefault(require("../../errors/appError"));
const user_model_1 = __importDefault(require("../user/user.model"));
const createBookPost = async (bookData, userId) => {
    const user = await user_model_1.default.findById(userId).select("userName");
    if (!user) {
        throw new appError_1.default(http_status_1.default.NOT_FOUND, "User not found");
    }
    const bookDataToSave = {
        ...bookData,
        postCreatorId: userId,
        postCreatorName: user.userName,
    };
    console.log(" in sv: ", bookDataToSave);
    const result = await book_model_1.BookModel.create(bookDataToSave);
    return result;
};
const getAllBookPosts = async () => {
    const result = await book_model_1.BookModel.find().sort({ createdAt: -1 });
    return result;
};
const getMyBookPosts = async (userId) => {
    const result = await book_model_1.BookModel.find({ postCreatorId: userId }).sort({ createdAt: -1 });
    return result;
};
const updateBookPost = async (postId, userId, userRole, payload) => {
    const existing = await book_model_1.BookModel.findById(postId);
    if (!existing) {
        throw new appError_1.default(http_status_1.default.NOT_FOUND, "Book post not found");
    }
    if (userRole !== "admin" && existing.postCreatorId.toString() !== userId.toString()) {
        throw new appError_1.default(http_status_1.default.FORBIDDEN, "You are not authorized to update this post");
    }
    delete payload.postCreatorId;
    delete payload.postCreatorName;
    const result = await book_model_1.BookModel.findByIdAndUpdate(postId, payload, {
        new: true,
        runValidators: true,
    });
    return result;
};
const deleteBookPost = async (postId, userId, userRole) => {
    const existing = await book_model_1.BookModel.findById(postId);
    if (!existing) {
        throw new appError_1.default(http_status_1.default.NOT_FOUND, "Book post not found");
    }
    if (userRole !== "admin" && existing.postCreatorId.toString() !== userId.toString()) {
        throw new appError_1.default(http_status_1.default.FORBIDDEN, "You are not authorized to delete this post");
    }
    const result = await book_model_1.BookModel.findByIdAndDelete(postId);
    return result;
};
exports.BookService = {
    createBookPost,
    getAllBookPosts,
    getMyBookPosts,
    updateBookPost,
    deleteBookPost,
};
// {
//     "title": "approveda",
//     "shortDescription": "string",
//     "longDescription": "longDescription",
//     "publishingYear": "2020"
// }
