import express from 'express';
import { 
    createTask, 
    getTasks, 
    updateTask, 
    deleteTask, 
    addComment,
    getMyTasks 
} from '../controllers/taskController.js';
import { protect, checkOrgAccess } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.use(checkOrgAccess); // All task routes require org context

router.route('/')
    .get(getTasks)
    .post(createTask);

router.get('/me', getMyTasks);

router.route('/:id')
    .put(updateTask)
    .delete(deleteTask);

router.post('/:id/comments', addComment);

export default router;