import dotenv from "dotenv";
import path from "path";
import connectDB from "./db/config";
import { app } from "./app";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

connectDB().then(() => {
  const requestedPort = Number(process.env.PORT);
  const port = requestedPort && requestedPort !== 3000 ? requestedPort : 8000;
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
});