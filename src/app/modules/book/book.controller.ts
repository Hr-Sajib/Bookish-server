import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { BookService } from "./book.service";
import AppError from "../../errors/appError";
import { uploadSingleFileToS3 } from "../../utils/fileUpload";


const createBookPost = catchAsync(async (req: Request, res: Response) => {

  const userId = req.user?.userId;
  if (!userId) {
    throw new AppError(httpStatus.UNAUTHORIZED, "User ID missing from token!");
  }

  if (!req.file) {
    throw new AppError(httpStatus.BAD_REQUEST, "Cover image is required!");
  }

  const coverImageUrl = await uploadSingleFileToS3(req.file, "book-covers");

  console.log("coverImageUrl in ctrl :", coverImageUrl.url)

  const bookData = {
    ...req.body,
    coverUrl: coverImageUrl.url,
  };

  const newBook = await BookService.createBookPost(bookData, userId);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Book post created successfully",
    data: newBook,
  });
});

const getAllBookPosts = catchAsync(async (req: Request, res: Response) => {
  const books = await BookService.getAllBookPosts();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "All book posts fetched successfully",
    data: books,
  });
});


const getMyBookPosts = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  if (!userId) {
    throw new AppError(httpStatus.UNAUTHORIZED, "User ID missing from token!");
  }

  const books = await BookService.getMyBookPosts(userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "My book posts fetched successfully",
    data: books,
  });
});



const updateBookPost = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.userId;
  const userRole = req.user?.role;

  if (!userId) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'User ID missing from token!');
  }

  let bookData = { ...req.body };

  // Handle cover image upload if provided
  if (req.file) {
    const coverImageUrl = await uploadSingleFileToS3(req.file, 'book-covers');
    bookData.coverUrl = coverImageUrl.url;
  }

  const updatedBook = await BookService.updateBookPost(id, userId, userRole, bookData);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Book post updated successfully',
    data: updatedBook,
  });
});


const deleteBookPost = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user?.userId;
  const userRole = req.user?.role;

  if (!userId) {
    throw new AppError(httpStatus.UNAUTHORIZED, "User ID missing from token!");
  }

  const deletedBook = await BookService.deleteBookPost(id, userId, userRole);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Book post deleted successfully",
    data: deletedBook,
  });
});

export const BookController = {
  createBookPost,
  getAllBookPosts,
  getMyBookPosts,
  updateBookPost,
  deleteBookPost,
};