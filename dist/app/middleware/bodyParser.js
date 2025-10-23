"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseBody = void 0;
const http_status_1 = __importDefault(require("http-status"));
const appError_1 = __importDefault(require("../errors/appError"));
const catchAsync_1 = __importDefault(require("../utils/catchAsync"));
exports.parseBody = (0, catchAsync_1.default)(async (req, res, next) => {
    if (!req.body.data) {
        throw new appError_1.default(http_status_1.default.BAD_REQUEST, "Please provide data in the body under data key");
    }
    req.body = JSON.parse(req.body.data);
    next();
});
