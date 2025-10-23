"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookController = void 0;
const http_status_1 = __importDefault(require("http-status"));
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const book_service_1 = require("./book.service");
const appError_1 = __importDefault(require("../../errors/appError"));
const fileUpload_1 = require("../../utils/fileUpload");
const createBookPost = (0, catchAsync_1.default)(async (req, res) => {
    const userId = req.user?.userId;
    if (!userId) {
        throw new appError_1.default(http_status_1.default.UNAUTHORIZED, "User ID missing from token!");
    }
    if (!req.file) {
        throw new appError_1.default(http_status_1.default.BAD_REQUEST, "Cover image is required!");
    }
    const coverImageUrl = await (0, fileUpload_1.uploadSingleFileToS3)(req.file, "book-covers");
    console.log("coverImageUrl in ctrl :", coverImageUrl.url);
    const bookData = {
        ...req.body,
        coverUrl: coverImageUrl.url,
    };
    const newBook = await book_service_1.BookService.createBookPost(bookData, userId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.CREATED,
        success: true,
        message: "Book post created successfully",
        data: newBook,
    });
});
const getAllBookPosts = (0, catchAsync_1.default)(async (req, res) => {
    const books = await book_service_1.BookService.getAllBookPosts();
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "All book posts fetched successfully",
        data: books,
    });
});
const getMyBookPosts = (0, catchAsync_1.default)(async (req, res) => {
    const userId = req.user?.userId;
    if (!userId) {
        throw new appError_1.default(http_status_1.default.UNAUTHORIZED, "User ID missing from token!");
    }
    const books = await book_service_1.BookService.getMyBookPosts(userId);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "My book posts fetched successfully",
        data: books,
    });
});
const updateBookPost = (0, catchAsync_1.default)(async (req, res) => {
    const { id } = req.params;
    const userId = req.user?.userId;
    const userRole = req.user?.role;
    if (!userId) {
        throw new appError_1.default(http_status_1.default.UNAUTHORIZED, 'User ID missing from token!');
    }
    let bookData = { ...req.body };
    // Handle cover image upload if provided
    if (req.file) {
        const coverImageUrl = await (0, fileUpload_1.uploadSingleFileToS3)(req.file, 'book-covers');
        bookData.coverUrl = coverImageUrl.url;
    }
    const updatedBook = await book_service_1.BookService.updateBookPost(id, userId, userRole, bookData);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: 'Book post updated successfully',
        data: updatedBook,
    });
});
const deleteBookPost = (0, catchAsync_1.default)(async (req, res) => {
    const { id } = req.params;
    const userId = req.user?.userId;
    const userRole = req.user?.role;
    if (!userId) {
        throw new appError_1.default(http_status_1.default.UNAUTHORIZED, "User ID missing from token!");
    }
    const deletedBook = await book_service_1.BookService.deleteBookPost(id, userId, userRole);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Book post deleted successfully",
        data: deletedBook,
    });
});
exports.BookController = {
    createBookPost,
    getAllBookPosts,
    getMyBookPosts,
    updateBookPost,
    deleteBookPost,
};
