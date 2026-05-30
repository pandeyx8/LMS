import dotenv from "dotenv";
import path from "path";
import connectDB from "./db/config";
import { app } from "./app";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

connectDB().then(() => {
  const port = Number(process.env.PORT) || 3000;
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
});