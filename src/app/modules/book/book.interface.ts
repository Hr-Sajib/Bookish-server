import { Types } from "mongoose";

export interface IBook {
    _id: Types.ObjectId;

    title: string,
    shortDescription: string,
    longDescription: string,
    authorName: string,
    publishingYear: string,

    postCreatorId: Types.ObjectId;
    postCreatorName: string;
    postCreatorDesignation: string;

}