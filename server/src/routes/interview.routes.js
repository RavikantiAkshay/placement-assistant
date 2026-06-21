import { Router } from 'express';
import { startInterview, getInterview, submitTextAnswer } from '../controllers/interview.controller.js';
import authenticate from '../middleware/auth.middleware.js';

const router = Router();

router.use(authenticate);

router.post('/start', startInterview);
router.get('/:id', getInterview);
router.post('/:id/answer', submitTextAnswer);

export default router;
