import { Schema, model } from "mongoose";
import { IBook } from "./book.interface";

const bookSchema = new Schema<IBook>(
  {
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
      type: Schema.Types.ObjectId,
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
  },
  {
    timestamps: true, // adds createdAt and updatedAt
    versionKey: false,
  }
);

export const BookModel = model<IBook>("Book", bookSchema);
