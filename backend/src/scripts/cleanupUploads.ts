import fs from "fs";
import path from "path";

const uploadDir = path.resolve(process.cwd(), "public", "uploads", "salary-slips");
const DAYS = Number(process.env.UPLOAD_RETENTION_DAYS ?? 90);

const msInDay = 24 * 60 * 60 * 1000;

if (!fs.existsSync(uploadDir)) {
  console.log("Upload directory does not exist, nothing to clean.");
  process.exit(0);
}

const now = Date.now();

fs.readdir(uploadDir, (err, files) => {
  if (err) {
    console.error("Failed to read upload directory:", err);
    process.exit(1);
  }

  let removed = 0;
  files.forEach((file) => {
    const filePath = path.join(uploadDir, file);
    try {
      const stats = fs.statSync(filePath);
      const ageDays = (now - stats.mtimeMs) / msInDay;
      if (ageDays > DAYS) {
        fs.unlinkSync(filePath);
        removed += 1;
      }
    } catch (e) {
      console.warn("Skipping file due to error:", file, e);
    }
  });

  console.log(`Cleanup complete. Removed ${removed} files older than ${DAYS} days.`);
  process.exit(0);
});
