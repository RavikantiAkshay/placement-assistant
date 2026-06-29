import { Router } from 'express';
import { startInterview, getInterview, submitTextAnswer, getAllInterviews, getFeedback, deleteInterview, transcribeAudioEndpoint, endSession } from '../controllers/interview.controller.js';
import authenticate from '../middleware/auth.middleware.js';
import { apiLimiter, groqApiLimiter } from '../middleware/rateLimiter.middleware.js';
import multer from 'multer';
import os from 'os';
import path from 'path';
import fs from 'fs';

const router = Router();

const tempUploadDir = path.join(os.tmpdir(), 'placement-assistant-uploads');
if (!fs.existsSync(tempUploadDir)) {
  fs.mkdirSync(tempUploadDir, { recursive: true });
}

const upload = multer({ dest: tempUploadDir }); // Use specific temp directory for audio

router.use(authenticate);

router.get('/', getAllInterviews);
router.post('/start', apiLimiter, startInterview);
router.post('/transcribe', groqApiLimiter, upload.single('audio'), transcribeAudioEndpoint);
router.get('/:id', getInterview);
router.delete('/:id', deleteInterview);
router.post('/:id/answer', groqApiLimiter, submitTextAnswer);
router.post('/:id/end', groqApiLimiter, endSession);
router.get('/:id/feedback', getFeedback);

export default router;
