import express from 'express';
import { 
    createOrganization, 
    joinOrganization, 
    getUserOrganizations, 
    inviteMember,
    getOrgMembers
} from '../controllers/orgController.js';
import { protect, checkOrgAccess } from '../middleware/auth.js';

const router = express.Router();

router.use(protect); // All org routes need auth

router.post('/', createOrganization);
router.post('/join', joinOrganization);
router.get('/', getUserOrganizations);

// Org specific actions requiring org scoping
router.post('/invite', checkOrgAccess, inviteMember);
router.get('/members', checkOrgAccess, getOrgMembers);

export default router;