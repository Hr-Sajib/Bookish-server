"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileUploadUtil = exports.uploadSingleFileToS3 = exports.optimizeImage = exports.upload = exports.fileFilter = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const multer_1 = __importDefault(require("multer"));
const path_1 = require("path");
const http_status_1 = __importDefault(require("http-status"));
const sharp_1 = __importDefault(require("sharp"));
const config_1 = __importDefault(require("../config"));
const appError_1 = __importDefault(require("../errors/appError"));
// AWS S3 Client Configuration
const s3Client = new client_s3_1.S3Client({
    region: config_1.default.aws.aws_region,
    credentials: {
        accessKeyId: config_1.default.aws.aws_access_key_id,
        secretAccessKey: config_1.default.aws.aws_secret_access_key,
    },
});
// Multer storage configuration (memory storage for S3 upload)
const storage = multer_1.default.memoryStorage();
// File filter to allow only images
const fileFilter = (req, file, cb) => {
    const allowedMimes = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"];
    console.log("[Multer] Incoming file:", {
        fieldname: file.fieldname,
        originalName: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
    });
    if (allowedMimes.includes(file.mimetype)) {
        console.log("[Multer] File accepted:", file.originalname);
        cb(null, true);
    }
    else {
        console.log("[Multer] File rejected:", file.originalname);
        cb(new appError_1.default(http_status_1.default.BAD_REQUEST, "Invalid file type. Only JPEG, PNG, GIF, WEBP, and SVG are allowed."));
    }
};
exports.fileFilter = fileFilter;
// ✅ Proper Multer instance (not a middleware)
exports.upload = (0, multer_1.default)({
    storage,
    // fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
    },
});
// Function to optimize image based on type
const optimizeImage = async (file) => {
    const originalExtension = (0, path_1.extname)(file.originalname).toLowerCase();
    try {
        const sharpInstance = (0, sharp_1.default)(file.buffer);
        // 🧠 Get image metadata
        const metadata = await sharpInstance.metadata();
        // ⚙️ Skip optimization for small images (under 100 KB)
        const SMALL_IMAGE_THRESHOLD = 100 * 1024; // 100 KB
        if (file.size < SMALL_IMAGE_THRESHOLD) {
            console.log(`Skipping optimization for small image: ${file.originalname} (${file.size} bytes)`);
            return {
                buffer: file.buffer,
                mimetype: file.mimetype,
                extension: originalExtension,
            };
        }
        let optimizedBuffer;
        let outputMimetype;
        let outputExtension;
        // 🔧 Determine output format and optimization settings
        switch (file.mimetype) {
            case "image/jpeg":
            case "image/jpg":
                optimizedBuffer = await sharpInstance
                    .resize(1200, 800, {
                    fit: "inside",
                    withoutEnlargement: true,
                })
                    .jpeg({
                    quality: 80,
                    mozjpeg: true,
                })
                    .toBuffer();
                outputMimetype = "image/jpeg";
                outputExtension = ".jpg";
                break;
            case "image/png":
                optimizedBuffer = await sharpInstance
                    .resize(1200, 800, {
                    fit: "inside",
                    withoutEnlargement: true,
                })
                    .png({
                    quality: 80,
                    compressionLevel: 9,
                })
                    .toBuffer();
                outputMimetype = "image/png";
                outputExtension = ".png";
                break;
            case "image/webp":
                optimizedBuffer = await sharpInstance
                    .resize(1200, 800, {
                    fit: "inside",
                    withoutEnlargement: true,
                })
                    .webp({ quality: 80 })
                    .toBuffer();
                outputMimetype = "image/webp";
                outputExtension = ".webp";
                break;
            case "image/gif":
                // GIFs: resize but keep format
                optimizedBuffer = await sharpInstance
                    .resize(800, 600, {
                    fit: "inside",
                    withoutEnlargement: true,
                })
                    .gif()
                    .toBuffer();
                outputMimetype = "image/gif";
                outputExtension = ".gif";
                break;
            case "image/svg+xml":
                // SVGs are vector — no need to optimize
                optimizedBuffer = file.buffer;
                outputMimetype = "image/svg+xml";
                outputExtension = ".svg";
                break;
            default:
                // Fallback: compress to JPEG
                optimizedBuffer = await sharpInstance
                    .resize(1200, 800, {
                    fit: "inside",
                    withoutEnlargement: true,
                })
                    .jpeg({ quality: 80 })
                    .toBuffer();
                outputMimetype = "image/jpeg";
                outputExtension = ".jpg";
        }
        console.log(`✅ Image optimized: ${file.originalname} -> ${outputExtension} (Original: ${file.size} bytes, Optimized: ${optimizedBuffer.length} bytes)`);
        return {
            buffer: optimizedBuffer,
            mimetype: outputMimetype,
            extension: outputExtension,
        };
    }
    catch (error) {
        console.error(`❌ Error optimizing image ${file.originalname}:`, error);
        // Fallback to original
        return {
            buffer: file.buffer,
            mimetype: file.mimetype,
            extension: originalExtension,
        };
    }
};
exports.optimizeImage = optimizeImage;
// Function to upload a single optimized file to S3
const uploadSingleFileToS3 = async (file, folder = "service-images") => {
    try {
        // Optimize the image
        const optimizedImage = await (0, exports.optimizeImage)(file);
        const fileName = `${folder}/${Date.now()}-${Math.random()
            .toString(36)
            .substring(2, 15)}${optimizedImage.extension}`;
        const params = {
            Bucket: config_1.default.aws.aws_s3_bucket_name,
            Key: fileName,
            Body: optimizedImage.buffer,
            ContentType: optimizedImage.mimetype,
            // Add cache control for better performance
            CacheControl: 'public, max-age=31536000',
        };
        await s3Client.send(new client_s3_1.PutObjectCommand(params));
        const url = `https://${config_1.default.aws.aws_s3_bucket_name}.s3.${config_1.default.aws.aws_region}.amazonaws.com/${fileName}`;
        return {
            url,
            key: fileName,
            originalName: file.originalname,
            size: optimizedImage.buffer.length,
            mimetype: optimizedImage.mimetype
        };
    }
    catch (error) {
        throw new appError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, `Failed to upload file to S3: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
};
exports.uploadSingleFileToS3 = uploadSingleFileToS3;
// Function to upload multiple optimized files to S3
const uploadMultipleFilesToS3 = async (files, folder = "service-images") => {
    try {
        // Limit concurrent uploads to avoid overwhelming the system
        const MAX_CONCURRENT_UPLOADS = 3;
        const results = [];
        // Process files in batches to avoid memory issues
        for (let i = 0; i < files.length; i += MAX_CONCURRENT_UPLOADS) {
            const batch = files.slice(i, i + MAX_CONCURRENT_UPLOADS);
            const batchPromises = batch.map((file) => (0, exports.uploadSingleFileToS3)(file, folder));
            const batchResults = await Promise.all(batchPromises);
            results.push(...batchResults);
        }
        console.log(`Successfully uploaded ${results.length} files to S3`);
        return results;
    }
    catch (error) {
        throw new appError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, `Failed to upload files to S3: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
};
// Function to delete a file from S3
const deleteFileFromS3 = async (key) => {
    try {
        const params = {
            Bucket: config_1.default.aws.aws_s3_bucket_name,
            Key: key,
        };
        await s3Client.send(new client_s3_1.DeleteObjectCommand(params));
        console.log(`Successfully deleted file from S3: ${key}`);
    }
    catch (error) {
        throw new appError_1.default(http_status_1.default.INTERNAL_SERVER_ERROR, `Failed to delete file from S3: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
};
// Function to clean up uploaded files if service creation fails
const cleanupUploadedFiles = async (uploadResults) => {
    try {
        if (uploadResults.length === 0) {
            return;
        }
        console.log(`Cleaning up ${uploadResults.length} uploaded files...`);
        const deletePromises = uploadResults.map((result) => deleteFileFromS3(result.key).catch(error => {
            // Log individual deletion errors but don't stop the cleanup process
            console.error(`Failed to delete file ${result.key}:`, error);
            return null;
        }));
        await Promise.all(deletePromises);
        console.log(`Successfully cleaned up ${uploadResults.length} uploaded files`);
    }
    catch (error) {
        console.error('Error during cleanup of uploaded files:', error);
        // Don't throw error during cleanup to avoid masking original error
    }
};
// Function to extract S3 key from URL
const extractKeyFromUrl = (url) => {
    try {
        const bucketName = config_1.default.aws.aws_s3_bucket_name;
        const region = config_1.default.aws.aws_region;
        // Handle different URL formats
        const patterns = [
            new RegExp(`https://${bucketName}\\.s3\\.${region}\\.amazonaws\\.com/(.+)`),
            new RegExp(`https://${bucketName}\\.s3-${region}\\.amazonaws\\.com/(.+)`),
            new RegExp(`https://s3\\.${region}\\.amazonaws\\.com/${bucketName}/(.+)`)
        ];
        for (const pattern of patterns) {
            const match = url.match(pattern);
            if (match && match[1]) {
                return match[1];
            }
        }
        // Fallback: try to extract the key by splitting the URL
        const parts = url.split('/');
        return parts.slice(3).join('/'); // Remove protocol, domain, and bucket parts
    }
    catch (error) {
        console.error('Error extracting key from URL:', error);
        throw new appError_1.default(http_status_1.default.BAD_REQUEST, 'Invalid S3 URL format');
    }
};
// Function to validate file size before upload
const validateFileSize = (file) => {
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
        throw new appError_1.default(http_status_1.default.BAD_REQUEST, `File ${file.originalname} exceeds maximum size of 10MB`);
    }
};
// Function to validate multiple files
const validateFiles = (files) => {
    if (!files || files.length === 0) {
        throw new appError_1.default(http_status_1.default.BAD_REQUEST, "No files provided for upload");
    }
    files.forEach(file => {
        validateFileSize(file);
    });
    if (files.length > 10) {
        throw new appError_1.default(http_status_1.default.BAD_REQUEST, "Cannot upload more than 10 files at once");
    }
};
exports.FileUploadUtil = {
    upload: exports.upload,
    uploadSingleFileToS3: exports.uploadSingleFileToS3,
    uploadMultipleFilesToS3,
    deleteFileFromS3,
    cleanupUploadedFiles,
    extractKeyFromUrl,
    validateFileSize,
    validateFiles,
};
