import express from 'express';
import { createTask, getTasks, updateTask, deleteTask, addComment, getMyTasks, logTime } from '../controllers/taskController.js';
import { protect, checkOrgAccess } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.use(checkOrgAccess);

router.route('/')
  .get(getTasks)
  .post(createTask);

router.get('/me', getMyTasks);

router.route('/:id')
  .put(updateTask)
  .delete(deleteTask);

router.post('/:id/comments', addComment);
router.post('/:id/time', logTime);

export default router;