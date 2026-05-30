import mongoose from "mongoose";
import {dbName} from "../constant";

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI?.trim();

    if (!mongoUri) {
      throw new Error("MONGODB_URI is not set in .env");
    }
    
    await mongoose.connect(mongoUri, {
      dbName: dbName,
      serverSelectionTimeoutMS: 10000,
    });
    console.log("Connected to MongoDB");
       console.log("Connected DB:", mongoose.connection.name);
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error("Error connecting to MongoDB:", errMsg);
    throw error;
  }
}

export default connectDB;