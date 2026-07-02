import { Router } from 'express';
import { register, login, getProfile } from '../controllers/authController';
import { authenticateJWT } from '../middleware/authMiddleware';
import { validateBody } from '../middleware/validationMiddleware';
import { registerSchema, loginSchema } from '../validators/authValidator';

const router = Router();

router.post('/register', validateBody(registerSchema), register);
router.post('/login', validateBody(loginSchema), login);
router.get('/me', authenticateJWT, getProfile);

export default router;
