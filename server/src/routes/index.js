import { Router } from 'express';
import authRoutes from './auth.routes.js';
import resumeRoutes from './resume.routes.js';
import interviewRoutes from './interview.routes.js';
import doubtRoutes from './doubt.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/resume', resumeRoutes);
router.use('/interview', interviewRoutes);
router.use('/doubts', doubtRoutes);

export default router;
