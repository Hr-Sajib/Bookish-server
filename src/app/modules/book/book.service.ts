import { Types } from "mongoose";
import httpStatus from "http-status";
import { IBook } from "./book.interface";
import { BookModel } from "./book.model";
import AppError from "../../errors/appError";
import UserModel from "../user/user.model";

const createBookPost = async (bookData: IBook, userId: Types.ObjectId): Promise<IBook> => {

  const user = await UserModel.findById(userId).select("userName");
  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  const bookDataToSave = {
    ...bookData,
    postCreatorId: userId,
    postCreatorName: user.userName,
  };

  console.log(" in sv: ",bookDataToSave)

  const result = await BookModel.create(bookDataToSave);
  return result;
};


const getAllBookPosts = async (): Promise<IBook[]> => {
  const result = await BookModel.find().sort({ createdAt: -1 });
  return result;
};


const getMyBookPosts = async (userId: string | Types.ObjectId): Promise<IBook[]> => {
  const result = await BookModel.find({ postCreatorId: userId }).sort({ createdAt: -1 });
  return result;
};


const updateBookPost = async (
  postId: string,
  userId: string | Types.ObjectId,
  userRole: string,
  payload: Partial<IBook>
): Promise<IBook | null> => {
  const existing = await BookModel.findById(postId);
  if (!existing) {
    throw new AppError(httpStatus.NOT_FOUND, "Book post not found");
  }

  if (userRole !== "admin" && existing.postCreatorId.toString() !== userId.toString()) {
    throw new AppError(httpStatus.FORBIDDEN, "You are not authorized to update this post");
  }

  delete payload.postCreatorId;
  delete payload.postCreatorName;

  const result = await BookModel.findByIdAndUpdate(postId, payload, {
    new: true,
    runValidators: true,
  });

  return result;
};


const deleteBookPost = async (
  postId: string,
  userId: string | Types.ObjectId,
  userRole: string
): Promise<IBook | null> => {
  const existing = await BookModel.findById(postId);
  if (!existing) {
    throw new AppError(httpStatus.NOT_FOUND, "Book post not found");
  }

  if (userRole !== "admin" && existing.postCreatorId.toString() !== userId.toString()) {
    throw new AppError(httpStatus.FORBIDDEN, "You are not authorized to delete this post");
  }

  const result = await BookModel.findByIdAndDelete(postId);
  return result;
};

export const BookService = {
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
