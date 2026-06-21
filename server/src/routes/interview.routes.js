import { Router } from 'express';
import { startInterview, getInterview, submitTextAnswer, getAllInterviews, getFeedback } from '../controllers/interview.controller.js';
import authenticate from '../middleware/auth.middleware.js';

const router = Router();

router.use(authenticate);

router.get('/', getAllInterviews);
router.post('/start', startInterview);
router.get('/:id', getInterview);
router.post('/:id/answer', submitTextAnswer);
router.get('/:id/feedback', getFeedback);

export default router;
