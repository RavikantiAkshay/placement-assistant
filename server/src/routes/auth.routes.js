import { Router } from 'express';
import { register, login, getMe, updateGoals } from '../controllers/auth.controller.js';
import authenticate from '../middleware/auth.middleware.js';
import { validateRequest, registerSchema, loginSchema } from '../middleware/validate.middleware.js';
import { authLimiter } from '../middleware/rateLimiter.middleware.js';

const router = Router();

router.post('/register', authLimiter, validateRequest(registerSchema), register);
router.post('/login', authLimiter, validateRequest(loginSchema), login);
router.get('/me', authenticate, getMe);
router.put('/goals', authenticate, updateGoals);

export default router;
