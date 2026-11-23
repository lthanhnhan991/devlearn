import multer from 'multer';
import os from 'os';
import path from 'path';
import fs from 'fs';
import { AppError, ERROR_CODES } from '../types/errors';
import { env } from '../config/env';

const uploadDir = path.join(os.tmpdir(), 'devlearn-uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${ext}`);
  },
});

const ALLOWED_MIME_TYPES = ['video/mp4', 'video/webm', 'application/pdf'];
const MAX_FILE_SIZE = Math.max(env.MAX_VIDEO_MB, env.MAX_PDF_MB) * 1024 * 1024; // Tối đa 100 MB

export const uploadMiddleware = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      cb(
        new AppError(
          ERROR_CODES.UNSUPPORTED_FILE_TYPE,
          415,
          'Định dạng file không được hỗ trợ. Chỉ chấp nhận video/mp4, video/webm hoặc application/pdf.',
        ),
      );
      return;
    }
    cb(null, true);
  },
});
