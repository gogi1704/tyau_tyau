import multer from "multer";
import path from "path";
import crypto from "crypto";

// process.cwd() — не __dirname — потому что компилятор кладёт index.ts в
// dist/src/index.js, а upload.ts в dist/src/lib/upload.js: расстояние до
// корня backend/ через __dirname/".." отличается между dev (ts-node) и
// прод-сборкой. CWD всегда = корень backend/ (и там, и там процесс
// стартует из этой директории), поэтому путь стабилен в обоих случаях.
export const UPLOADS_DIR = path.join(process.cwd(), "uploads");

const storage = multer.diskStorage({
  destination: UPLOADS_DIR,
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || ".jpg";
    cb(null, `${crypto.randomUUID()}${ext}`);
  },
});

export const upload = multer({ storage, limits: { fileSize: 8 * 1024 * 1024 } });
