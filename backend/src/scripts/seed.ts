import path from "path";
import dotenv from "dotenv";
import mongoose from "mongoose";
import connectDB from "../db/config";
import { User } from "../models/user.model";

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

type SeedUser = {
  username: string;
  fullname: string;
  email: string;
  password: string;
  role: "admin" | "sales" | "sanction" | "disbursement" | "collection" | "borrower";
};

const seedUsers: SeedUser[] = [
  {
    username: "admin",
    fullname: "System Admin",
    email: "admin@lms.com",
    password: "Admin@123",
    role: "admin",
  },
  {
    username: "sales",
    fullname: "Sales Executive",
    email: "sales@lms.com",
    password: "Sales@123",
    role: "sales",
  },
  {
    username: "sanction",
    fullname: "Sanction Executive",
    email: "sanction@lms.com",
    password: "Sanction@123",
    role: "sanction",
  },
  {
    username: "disbursement",
    fullname: "Disbursement Executive",
    email: "disbursement@lms.com",
    password: "Disbursement@123",
    role: "disbursement",
  },
  {
    username: "collection",
    fullname: "Collection Executive",
    email: "collection@lms.com",
    password: "Collection@123",
    role: "collection",
  },
  {
    username: "borrower",
    fullname: "Priyanshu Pandey",
    email: "borrower@lms.com",
    password: "Borrower@123",
    role: "borrower",
  },
];

const seedDatabase = async () => {
  try {
    await connectDB();

    for (const seedUser of seedUsers) {
      const existingUser = await User.findOne({ email: seedUser.email });

      if (existingUser) {
        existingUser.username = seedUser.username;
        existingUser.fullname = seedUser.fullname;
        existingUser.email = seedUser.email;
        existingUser.password = seedUser.password;
        existingUser.role = seedUser.role;
        await existingUser.save();
        continue;
      }

      await User.create(seedUser);
    }

    console.log("Seed completed successfully");
    console.log("Login credentials:");
    seedUsers.forEach((user) => {
      console.log(`${user.role}: ${user.email} / ${user.password}`);
    });
  } catch (error) {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    process.exit();
  }
};

void seedDatabase();
