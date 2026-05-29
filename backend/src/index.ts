import express from "express";
import dotenv from "dotenv";
import connectDB from "./db/config";

dotenv.config({
  path: './.env'
});

connectDB().then(() => {
  const app = express();
  app.get("/", (req, res) => {
    res.send("Backend Running");
  });
  app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
  });
});