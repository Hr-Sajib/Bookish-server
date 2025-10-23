import express from "express";
import auth from "../../middleware/auth";
import validateRequest from "../../middleware/validateRequest";
import { BookController } from "./book.controller";
import { UserRole } from "../user/user.interface";
import { BookPostValidations } from "./book.validation";
import { FileUploadUtil } from "../../utils/fileUpload";


const router = express.Router();

// create 
router.post(
  "/",
  auth(UserRole.ADMIN, UserRole.USER),
  FileUploadUtil.upload.single("coverImage"),
  validateRequest(BookPostValidations.createBookValidationSchema),
  BookController.createBookPost
);


// get all 
router.get("/", BookController.getAllBookPosts);

// get mine 
router.get("/my", auth(UserRole.ADMIN, UserRole.USER), BookController.getMyBookPosts);

// Update
router.patch(
  '/:id',
  auth(UserRole.ADMIN, UserRole.USER),
  FileUploadUtil.upload.single('coverImage'),
  validateRequest(BookPostValidations.updateBookValidationSchema),
  BookController.updateBookPost
);

// delete 
router.delete("/:id", auth(UserRole.ADMIN, UserRole.USER), BookController.deleteBookPost);

export const BookRoutes = router;
