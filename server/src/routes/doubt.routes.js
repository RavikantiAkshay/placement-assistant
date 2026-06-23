import { Router } from 'express';
import { createOrUpdateDoubt, getDoubts, getDoubtById } from '../controllers/doubt.controller.js';
import authenticate from '../middleware/auth.middleware.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Ensure uploads directory exists
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

const router = Router();
// Set up multer to store files in 'uploads/' directory
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
  }
});
const upload = multer({ storage: storage });

router.use(authenticate);

router.post('/', upload.single('file'), createOrUpdateDoubt);
router.get('/', getDoubts);
router.get('/:id', getDoubtById);

export default router;
