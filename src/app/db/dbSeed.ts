
import mongoose from "mongoose";
import config from "../config";
import bcrypt from 'bcrypt';
import UserModel from "../modules/user/user.model";

const seedUsers = async () => {
  try {
    // 1️⃣ Connect to MongoDB
    await mongoose.connect(config.db_url!);
    console.log("✅ Connected to MongoDB for seeding");


    const usersToSeed = [
      {
        email: "admin@bookish.com",
        userName: "Admin",
        password: await bcrypt.hash('admin@bookish', Number(config.bcrypt_salt_rounds)),
        role: "admin",
        isVerified: true
      }
    ];

    // 3️⃣ Insert users
    await UserModel.insertMany(usersToSeed);
    console.log("✅ Users seeded successfully");

    // 4️⃣ Close connection
    await mongoose.connection.close();
    console.log("✅ MongoDB connection closed after seeding");
  } catch (error) {
    console.error("❌ Error while seeding users:", error);
    process.exit(1);
  }
};

seedUsers();
