import multer from 'multer';
import path from 'path';
import fs from 'fs';
import os from 'os';

const uploadTempDir = path.join(os.tmpdir(), 'finalround-uploads');

if (!fs.existsSync(uploadTempDir)) {
    fs.mkdirSync(uploadTempDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadTempDir);
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname || '');
        const baseName = path
            .basename(file.originalname || 'file', ext)
            .replace(/[^a-zA-Z0-9-_]/g, '_')
            .slice(0, 50);
        const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}-${baseName}${ext}`;
        cb(null, uniqueName);
    }
})

export const upload = multer({
    storage,
    limits: {
        fileSize: 10 * 1024 * 1024,
    },
})

