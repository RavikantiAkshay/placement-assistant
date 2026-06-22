import { Router } from 'express';
import { getChats, getChatById, createChat, deleteChat, askTextDoubt, askImageDoubt, askVoiceDoubt, getStats } from '../controllers/doubt.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Setup multer
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${req.user._id}-${Date.now()}${path.extname(file.originalname)}`);
  }
});
const upload = multer({ storage });

const router = Router();

router.use(protect);

router.get('/stats', getStats);
router.get('/', getChats);
router.post('/', createChat);
router.get('/:id', getChatById);
router.delete('/:id', deleteChat);

router.post('/:id/text', askTextDoubt);
router.post('/:id/image', upload.single('image'), askImageDoubt);
router.post('/:id/voice', upload.single('audio'), askVoiceDoubt);

export default router;
