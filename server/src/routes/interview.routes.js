import { Router } from 'express';
import { startInterview, getInterview, submitTextAnswer, getAllInterviews, getFeedback, deleteInterview, transcribeAudioEndpoint } from '../controllers/interview.controller.js';
import authenticate from '../middleware/auth.middleware.js';
import multer from 'multer';
import os from 'os';

const router = Router();
const upload = multer({ dest: os.tmpdir() }); // Use OS temp directory for audio

router.use(authenticate);

router.get('/', getAllInterviews);
router.post('/start', startInterview);
router.post('/transcribe', upload.single('audio'), transcribeAudioEndpoint);
router.get('/:id', getInterview);
router.delete('/:id', deleteInterview);
router.post('/:id/answer', submitTextAnswer);
router.get('/:id/feedback', getFeedback);

export default router;
