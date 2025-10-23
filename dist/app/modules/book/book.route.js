"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookRoutes = void 0;
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("../../middleware/auth"));
const validateRequest_1 = __importDefault(require("../../middleware/validateRequest"));
const book_controller_1 = require("./book.controller");
const user_interface_1 = require("../user/user.interface");
const book_validation_1 = require("./book.validation");
const fileUpload_1 = require("../../utils/fileUpload");
const router = express_1.default.Router();
// create 
router.post("/", (0, auth_1.default)(user_interface_1.UserRole.ADMIN, user_interface_1.UserRole.USER), fileUpload_1.FileUploadUtil.upload.single("coverImage"), (0, validateRequest_1.default)(book_validation_1.BookPostValidations.createBookValidationSchema), book_controller_1.BookController.createBookPost);
// get all 
router.get("/", book_controller_1.BookController.getAllBookPosts);
// get mine 
router.get("/my", (0, auth_1.default)(user_interface_1.UserRole.ADMIN, user_interface_1.UserRole.USER), book_controller_1.BookController.getMyBookPosts);
// Update
router.patch('/:id', (0, auth_1.default)(user_interface_1.UserRole.ADMIN, user_interface_1.UserRole.USER), fileUpload_1.FileUploadUtil.upload.single('coverImage'), (0, validateRequest_1.default)(book_validation_1.BookPostValidations.updateBookValidationSchema), book_controller_1.BookController.updateBookPost);
// delete 
router.delete("/:id", (0, auth_1.default)(user_interface_1.UserRole.ADMIN, user_interface_1.UserRole.USER), book_controller_1.BookController.deleteBookPost);
exports.BookRoutes = router;
