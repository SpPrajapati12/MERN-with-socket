import multer from "multer";
import path from "path";
import AppError from "../utils/AppError";

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) =>
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`),
});

const fileFilter = (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.mimetype.startsWith("image/")) cb(null, true);
  else cb(new AppError("Only image files are allowed", 400) as any);
};

export default multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });
