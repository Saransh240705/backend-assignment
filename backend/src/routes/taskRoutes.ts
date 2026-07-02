import { Router } from 'express';
import {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
} from '../controllers/taskController';
import { authenticateJWT } from '../middleware/authMiddleware';
import { validateBody } from '../middleware/validationMiddleware';
import { createTaskSchema, updateTaskSchema } from '../validators/taskValidator';

const router = Router();

// Apply auth middleware to all task routes
router.use(authenticateJWT);

router.post('/', validateBody(createTaskSchema), createTask);
router.get('/', getTasks);
router.get('/:id', getTaskById);
router.put('/:id', validateBody(updateTaskSchema), updateTask);
router.delete('/:id', deleteTask);

export default router;
