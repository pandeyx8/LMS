import fs from "fs";
import path from "path";
import multer from "multer";
import { ApiError } from "../utils/apiError";

const salarySlipUploadDir = path.resolve(
  process.cwd(),
  "public",
  "uploads",
  "salary-slips"
);

fs.mkdirSync(salarySlipUploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, salarySlipUploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const extension = path.extname(file.originalname).toLowerCase();
    cb(null, `${file.fieldname}-${uniqueSuffix}${extension}`);
  },
});

const allowedMimeTypes = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
]);

export const uploadSalarySlip = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    if (!allowedMimeTypes.has(file.mimetype)) {
      cb(new ApiError(400, "Salary slip must be PDF, JPG, or PNG"));
      return;
    }

    cb(null, true);
  },
});