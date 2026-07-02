import { Router } from 'express';
import { getUsers } from '../controllers/userController';
import { authenticateJWT, requireRole } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticateJWT);
router.use(requireRole(['ADMIN']));

router.get('/', getUsers);

export default router;
