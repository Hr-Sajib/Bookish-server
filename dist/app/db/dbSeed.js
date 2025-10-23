"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const config_1 = __importDefault(require("../config"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const user_model_1 = __importDefault(require("../modules/user/user.model"));
const seedUsers = async () => {
    try {
        // 1️⃣ Connect to MongoDB
        await mongoose_1.default.connect(config_1.default.db_url);
        console.log("✅ Connected to MongoDB for seeding");
        const usersToSeed = [
            {
                email: "admin@bookish.com",
                userName: "Admin",
                password: await bcrypt_1.default.hash('admin@bookish', Number(config_1.default.bcrypt_salt_rounds)),
                role: "admin",
                isVerified: true
            }
        ];
        // 3️⃣ Insert users
        await user_model_1.default.insertMany(usersToSeed);
        console.log("✅ Users seeded successfully");
        // 4️⃣ Close connection
        await mongoose_1.default.connection.close();
        console.log("✅ MongoDB connection closed after seeding");
    }
    catch (error) {
        console.error("❌ Error while seeding users:", error);
        process.exit(1);
    }
};
seedUsers();
